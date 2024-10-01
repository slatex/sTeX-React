import { NextApiRequest, NextApiResponse } from 'next';
import { executeAndEndSet500OnError } from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { homeworkId, homeworkName, homeworkDate, courseId, courseInstance, archive, filepath } =
      req.body;

    if (!homeworkId) {
      return res.status(400).json({ message: 'homeworkId is required' });
    }

    try {
      const result = await executeAndEndSet500OnError(
        'UPDATE homework SET homeworkName = ?, homeworkDate = ?, courseId = ?, courseInstance = ?, archive = ?, filepath = ? WHERE homeworkId = ?',
        [homeworkName, homeworkDate, courseId, courseInstance, archive, filepath, homeworkId],
        res
      );

      if (result) {
        res.status(200).json({ message: 'Homework updated successfully!' });
      }
    } catch (error) {
      console.error('Error updating homework:', error);
      res.status(500).json({ message: 'Error updating homework' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
