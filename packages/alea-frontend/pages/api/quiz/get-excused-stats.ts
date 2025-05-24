import { NextApiRequest, NextApiResponse } from 'next';
import { executeAndEndSet500OnError } from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { quizId, userId, courseId, courseInstance } = req.body;

  const query = `SELECT userId, quizId, courseId, courseInstance FROM excused
       WHERE quizId = ? AND courseId = ? AND courseInstance = ?`;
  const result = await executeAndEndSet500OnError(query, [quizId, courseId, courseInstance], res);
  if (!result || result.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.status(200).json({ userId, quizId, courseId, courseInstance });
}
