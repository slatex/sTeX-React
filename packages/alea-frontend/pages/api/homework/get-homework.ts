import { NextApiRequest, NextApiResponse } from 'next';
import { executeDontEndSet500OnError } from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const courseId = req.query.courseId as string;
    try {
      const results = await executeDontEndSet500OnError(
        'SELECT * FROM homework WHERE courseId = ? ORDER BY homeworkDate ASC',
        [courseId],
        res
      );
      console.log('resss', results);
      if (results) {
        res.status(200).json(results);
      }
    } catch (error) {
      console.error('Error fetching homework:', error);
      res.status(500).json({ message: 'Error fetching homework' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
