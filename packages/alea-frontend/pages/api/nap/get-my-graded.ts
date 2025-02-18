import { executeAndEndSet500OnError, getUserIdOrSetError } from '../comment-utils';
import { GradingAnswerClass, GradingWithAnswer } from '@stex-react/api';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;
  const grading = await executeAndEndSet500OnError<GradingWithAnswer[]>(
    `SELECT Grading.id,Answer.questionTitle,Answer.subProblemId,Grading.answerId,Answer.questionId,Grading.reviewType,Grading.customFeedback,Grading.totalPoints,Grading.updatedAt,Answer.courseInstance,Answer.courseId,Answer.answer FROM Answer INNER JOIN Grading ON Answer.id = Grading.answerId WHERE Grading.checkerId = ? and Answer.homeworkId is null ORDER BY Grading.updatedAt DESC`,
    [userId],
    res
  );
  const gradingAnswerClassess = await executeAndEndSet500OnError<GradingAnswerClass[]>(
    `SELECT gradingId,answerClassId,points,isTrait,closed,title,description,count from GradingAnswerClass where gradingId in (?)`,
    [grading.map((c) => c.id)],
    res
  );
  for (const grade of grading) {
    grade.answerClasses = gradingAnswerClassess.filter((c) => c.gradingId == grade.id);
  }
  return res.json(grading);
}
