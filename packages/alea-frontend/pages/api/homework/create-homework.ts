import { NextApiRequest, NextApiResponse } from 'next';
import { executeAndEndSet500OnError } from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { homeworkName, homeworkDate, courseId, courseInstance, archive, filepath } = req.body;

    try {
      const result = await executeAndEndSet500OnError(
        'INSERT INTO homework (homeworkName, homeworkDate, courseId, courseInstance, archive, filepath) VALUES (?, ?, ?, ?, ?, ?)',
        [homeworkName, homeworkDate, courseId, courseInstance, archive, filepath],
        res
      );

      if (result) {
        res.status(200).json({ message: 'Homework added successfully!' });
      }
    } catch (error) {
      console.error('Error inserting homework:', error);
      res.status(500).json({ message: 'Error inserting homework' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
