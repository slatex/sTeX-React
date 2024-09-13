import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfGetOrSetError, executeAndEndSet500OnError } from '../comment-utils';
import { AnswerResponse, AnswerClassResponse, GradeResponse } from '@stex-react/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res)) return;
  const id = req.query.id as string;
  //TODO: Adding acl. this api should return the answer only for the student him/herself or instructors. 
  const answer = (
    await executeAndEndSet500OnError<AnswerResponse[]>(`select * from Answer where id=?`, [id], res)
  )[0];
  const grades = await executeAndEndSet500OnError<GradeResponse[]>(
    `select * from Grading where answerId=?`,
    [id],
    res
  );
  const gradesAnswerClasses = await executeAndEndSet500OnError<AnswerClassResponse[]>(
    'select * from GradingAnswerClass where gradingId in (?)',
    [grades.map((c) => c.id)],
    res
  );
  for (const grade of grades) {
    grade.answerClasses = gradesAnswerClasses.filter((c) => c.gradingId == grade.id);
  }
  res.send({ answer, grades });
}
