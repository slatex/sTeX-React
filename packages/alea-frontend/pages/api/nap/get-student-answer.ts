import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfGetOrSetError, executeAndEndSet500OnError } from '../comment-utils';
import { Answer, AnswerClass, Grade } from '@stex-react/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res)) return;
  const id = req.query.id as string;
  const answer = (
    await executeAndEndSet500OnError<Answer[]>(`select * from Answer where id=?`, [id], res)
  )[0];
  const grades = await executeAndEndSet500OnError<Grade[]>(
    `select * from Grading where answerId=?`,
    [id],
    res
  );
  const gradesAnswerClasses = await executeAndEndSet500OnError<AnswerClass[]>(
    'select * from GradingAnswerClass where gradingId in (?)',
    [grades.flatMap((c) => c.id)],
    res
  );
  for (const grade of grades) {
    grade.answerClasses = gradesAnswerClasses.filter((c) => c.gradingId == grade.id);
  }
  res.send({ answer, grades });
}
