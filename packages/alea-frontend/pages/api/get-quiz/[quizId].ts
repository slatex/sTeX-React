import { GetQuizResponse, Phase, isModerator } from '@stex-react/api';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserIdOrSetError } from '../comment-utils';
import { queryGradingDbAndEndSet500OnError } from '../grading-db-utils';
import {
  getQuiz,
  getQuizPhase,
  getQuizTimes,
  removeAnswerInfo,
} from '../quiz-utils';

async function getUserQuizResponseOrSetError(
  quizId: string,
  userId: string,
  res: NextApiResponse
) {
  const results: any[] = await queryGradingDbAndEndSet500OnError(
    `SELECT problemId, singleOptionIdx, multipleOptionIdxs, filledInAnswer
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
  const responses: {
    [problemId: string]: {
      singleOptionIdx?: number;
      multipleOptionIdxs?: { [index: number]: boolean };
      filledInAnswer?: string;
    };
  } = {};

  for (const r of results) {
    const { problemId, singleOptionIdx, multipleOptionIdxs, filledInAnswer } =
      r;
    const multiIdxs = multipleOptionIdxs?.length ? {} : null;

    if (multiIdxs) {
      multipleOptionIdxs
        ?.split(',')
        .map((s) => parseInt(s))
        .forEach((idx) => (multiIdxs[idx] = true));
    }

    const data = {
      singleOptionIdx,
      multipleOptionIdxs: multiIdxs,
      filledInAnswer,
    };
    responses[problemId] = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== null)
    );
  }
  return responses;
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
  const isMod = isModerator(userId);
  const quizId = req.query.quizId as string;

  const quizInfo = getQuiz(quizId);
  if (!quizInfo) {
    res.status(400).json({ message: `Quiz not found: [${quizId}]` });
    return;
  }

  const phase = getQuizPhase(quizInfo);
  const quizTimes = getQuizTimes(quizInfo);
  const problems = getPhaseAppropriateProblems(quizInfo.problems, isMod, phase);
  const responses = await getUserQuizResponseOrSetError(quizId, userId, res);
  if (!responses) return;

  res.status(200).json({ phase, ...quizTimes, problems, responses } as GetQuizResponse);
  return;
}
