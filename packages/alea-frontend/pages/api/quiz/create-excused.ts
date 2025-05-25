import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfPostOrSetError, executeAndEndSet500OnError } from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const { quizId, userId, courseId, courseInstance } = req.body;
  if (!quizId) return res.status(422).send(`Missing Quiz id.`);

  const checkQuery = 'SELECT 1 FROM excused WHERE userId = ? AND quizId = ? LIMIT 1';
  const checkResult = await executeAndEndSet500OnError(checkQuery, [userId, quizId], res);
    if (Array.isArray(checkResult) && checkResult.length > 0) {
    return res.status(409).send('Student is already excused for this quiz.');
  }

  const query = 'INSERT INTO excused (userId, quizId, courseId, courseInstance) VALUES (?, ?, ?, ?)' ;
  const result = await executeAndEndSet500OnError(query, [userId, quizId, courseId, courseInstance], res);
  console.log('Excused quiz creation result:', result);
  res.status(200).end();
}
