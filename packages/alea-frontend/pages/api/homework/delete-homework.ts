import { NextApiRequest, NextApiResponse } from 'next';
import { executeAndEndSet500OnError } from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const { homeworkId } = req.body;
    console.log('reqQuery', homeworkId);
    if (!homeworkId) {
      return res.status(400).json({ message: 'homeworkId is required' });
    }

    try {
      const result = await executeAndEndSet500OnError(
        'DELETE FROM homework WHERE homeworkId = ?',
        [homeworkId],
        res
      );

      if (result) {
        res.status(200).json({ message: 'Homework deleted successfully!' });
      }
    } catch (error) {
      console.error('Error deleting homework:', error);
      res.status(500).json({ message: 'Error deleting homework' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
