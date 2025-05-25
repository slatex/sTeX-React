import { NextApiRequest, NextApiResponse } from 'next';
import { executeAndEndSet500OnError } from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Read from req.query for GET requests
  const { quizId, courseId, courseInstance } = req.query;

  const query = `SELECT userId, quizId, courseId, courseInstance FROM excused
       WHERE quizId = ? AND courseId = ? AND courseInstance = ?`;
  const result = await  executeAndEndSet500OnError(query, [quizId, courseId, courseInstance], res);
  console.log('Excused stats retrieval result:', result);

  // Return the actual result
  return res.status(200).json(result);
}
