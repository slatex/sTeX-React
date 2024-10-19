import {
  GetQuizResponse,
  InputResponse,
  Phase,
  ProblemResponse
} from '@stex-react/api';
import { getQuiz, getQuizTimes } from '@stex-react/node-utils';
import { getQuizPhase, removeAnswerInfo } from '@stex-react/quiz-utils';
import { Action, ResourceName, simpleNumberHash } from '@stex-react/utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { isUserIdAuthorizedForAny, ResourceActionParams } from '../../access-control/resource-utils';
import { getUserIdOrSetError } from '../../comment-utils';
import { queryGradingDbAndEndSet500OnError } from '../../grading-db-utils';

async function getUserQuizResponseOrSetError(
  quizId: string,
  userId: string,
  res: NextApiResponse
) {
  const results: any[] = await queryGradingDbAndEndSet500OnError(
    `SELECT problemId, response
    FROM grading
    WHERE (quizId, problemId, browserTimestamp_ms) IN (
        SELECT quizId, problemId, MAX(browserTimestamp_ms) AS browserTimestamp_ms
        FROM grading
        WHERE quizId = ? AND userId = ?
        GROUP BY problemId
    )`,
    [quizId, userId],
    res
  );
  if (!results) return undefined;
  const resp: { [problemId: string]: ProblemResponse } = {};

  for (const r of results) {
    const { problemId, response } = r;
    const responses: InputResponse[] = JSON.parse(response);
    resp[problemId] = { responses };
  }
  return resp;
}

function shuffleArray(arr: any[], seed: number) {
  const numericHash = Math.abs(seed);

  //  Simplified Fisher-Yates shuffle algorithm
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(numericHash % (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function reorderBasedOnUserId(
  isModerator: boolean,
  problems: { [problemId: string]: string },
  userId: string
) {
  if (isModerator) return problems;

  const problemIds = Object.keys(problems);
  shuffleArray(problemIds, simpleNumberHash(userId));
  const shuffled: { [problemId: string]: string } = {};
  problemIds.forEach(
    (problemId) => (shuffled[problemId] = problems[problemId])
  );
  return shuffled;
}

function getPhaseAppropriateProblems(
  problems: { [problemId: string]: string },
  isModerator: boolean,
  phase: Phase
): { [problemId: string]: string } {
  if (isModerator) return problems;
  switch (phase) {
    case Phase.STARTED:
    case Phase.ENDED: {
      const problemsCopy = {};
      for (const problemId in problems) {
        problemsCopy[problemId] = removeAnswerInfo(problems[problemId]);
      }
      return problemsCopy;
    }
    case Phase.FEEDBACK_RELEASED:
      return problems;
    case Phase.NOT_STARTED:
    default:
      return {};
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;

  const quizId = req.query.quizId as string;
  const quizInfo = getQuiz(quizId);
  const {courseTerm, courseId} = quizInfo;
  if (!quizInfo) {
    res.status(400).json({ message: `Quiz not found: [${quizId}]` });
    return;
  }

  const moderatorAction: ResourceActionParams = {
    name: ResourceName.COURSE_QUIZ,
    action: Action.MUTATE,
    variables: { courseId, instanceId: courseTerm },
  };
  const isModerator = await isUserIdAuthorizedForAny(userId, [moderatorAction]);

  const phase = getQuizPhase(quizInfo);
  const quizTimes = getQuizTimes(quizInfo);
  const problems = getPhaseAppropriateProblems(quizInfo.problems, isModerator, phase);
  const responses = await getUserQuizResponseOrSetError(quizId, userId, res);
  if (!responses) return;

  res.status(200).json({
    courseId,
    courseTerm,
    currentServerTs: Date.now(),
    ...quizTimes,
    phase,
    problems: reorderBasedOnUserId(isModerator, problems, userId),
    responses,
  } as GetQuizResponse);
  return;
}
