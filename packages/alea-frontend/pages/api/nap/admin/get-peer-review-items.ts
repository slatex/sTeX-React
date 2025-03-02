import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfGetOrSetError,
  checkIfQueryParameterExistOrSetError,
  executeAndEndSet500OnError,
} from '../../comment-utils';
import { getUserIdIfAnyAuthorizedOrSetError } from '../../access-control/resource-utils';
import { Action, ResourceName } from '@stex-react/utils';
import { GradingAnswerClass, GradingWithAnswer } from '@stex-react/api';
import { addAnswerClassesToGrading } from '../nap-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res)) return;
  const userId = await getUserIdIfAnyAuthorizedOrSetError(req, res, [
    { name: ResourceName.COURSE_PEERREVIEW, action: Action.MODERATE },
  ]);
  if (!userId) return;
  if (!checkIfQueryParameterExistOrSetError(req, res, 'courseId')) return;
  const courseId = req.query.courseId as string;
  const grading = await executeAndEndSet500OnError<GradingWithAnswer[]>(
    `SELECT Grading.id,Answer.questionTitle,Answer.subProblemId,Grading.answerId,Answer.questionId,Grading.reviewType,Grading.customFeedback,Grading.totalPoints,Grading.updatedAt,Answer.courseInstance,Answer.courseId,Answer.answer FROM Answer INNER JOIN Grading ON Answer.id = Grading.answerId WHERE Answer.courseId = ? and Answer.homeworkId is null ORDER BY Grading.updatedAt DESC`,
    [courseId],
    res
  );
  return res.json(await addAnswerClassesToGrading(grading, res));
}
