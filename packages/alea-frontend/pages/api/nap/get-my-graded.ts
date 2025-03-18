import { executeAndEndSet500OnError, getUserIdOrSetError } from '../comment-utils';
import { GradingWithAnswer } from '@stex-react/api';
import { NextApiRequest, NextApiResponse } from 'next';
import { addAnswerClassesToGrading } from './nap-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;
  const grading = await executeAndEndSet500OnError<GradingWithAnswer[]>(
    `SELECT Grading.id,Answer.questionTitle,Answer.subProblemId,Grading.answerId,Answer.questionId,Grading.reviewType,Grading.customFeedback,Grading.totalPoints,Grading.updatedAt,Answer.courseInstance,Answer.courseId,Answer.answer FROM Answer INNER JOIN Grading ON Answer.id = Grading.answerId WHERE Grading.checkerId = ? and Answer.homeworkId is null ORDER BY Grading.updatedAt DESC`,
    [userId],
    res
  );
  return res.json(addAnswerClassesToGrading(grading, res));
}
