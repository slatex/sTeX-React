import { GradingWithAnswer, GradingAnswerClass } from '@stex-react/api';
import { NextApiResponse } from 'next';
import { executeAndEndSet500OnError } from '../comment-utils';

export async function addAnswerClassesToGrading(
  grading: GradingWithAnswer[],
  res: NextApiResponse
) {
  if (grading.length === 0) return grading;
  const gradingAnswerClassess = await executeAndEndSet500OnError<GradingAnswerClass[]>(
    `SELECT gradingId,answerClassId,points,isTrait,closed,title,description,count from GradingAnswerClass where gradingId in (?)`,
    [grading.map((c) => c.id)],
    res
  );
  for (const grade of grading) {
    grade.answerClasses = gradingAnswerClassess.filter((c) => c.gradingId == grade.id);
  }
  return grading;
}
