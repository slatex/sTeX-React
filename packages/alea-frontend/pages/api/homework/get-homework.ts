import { getHomeworkPhase, HomeworkInfo, HomeworkPhase } from '@stex-react/api';
import { removeAnswerInfo } from '@stex-react/quiz-utils';
import { Action, ResourceName } from '@stex-react/utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { isUserIdAuthorizedForAny, ResourceActionParams } from '../access-control/resource-utils';
import {
  checkIfGetOrSetError,
  executeDontEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';

function getPhaseAppropriateProblems(
  problems: { [problemId: string]: string },
  isModerator: boolean,
  phase: HomeworkPhase
): { [problemId: string]: string } {
  if (isModerator) return problems;
  switch (phase) {
    case 'FEEDBACK_RELEASED':
    case 'SUBMISSION_CLOSED':
      return problems;
    case 'GIVEN':
      const problemsCopy = {};
      for (const problemId in problems) {
        problemsCopy[problemId] = removeAnswerInfo(problems[problemId]);
      }
      return problemsCopy;
    case 'NOT_GIVEN':
    default:
      return {};
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  const homeworkId = req.query.id as string;
  if (!homeworkId) return res.status(422).send('Missing params.');
  const results: any = await executeDontEndSet500OnError(
    `SELECT id, title, givenTs, dueTs, feedbackReleaseTs, courseId, courseInstance, problems 
    FROM homework 
    WHERE id = ?`,
    [homeworkId],
    res
  );
  if (!results) return;
  if (!results.length) return res.status(404).send('No homework found');

  const hwork = results[0];
  hwork.problems = JSON.parse(hwork.problems);  
  const phase = getHomeworkPhase(hwork);

  const { courseId, courseInstance } = hwork;
  const hwModeratorAction: ResourceActionParams = {
    name: ResourceName.COURSE_HOMEWORK,
    action: Action.MUTATE,
    variables: { courseId, instanceId: courseInstance },
  };
  const isModerator = await isUserIdAuthorizedForAny(userId, [hwModeratorAction]);
  hwork.problems = getPhaseAppropriateProblems(hwork.problems, isModerator, phase);

  res.status(200).json(hwork);
}
