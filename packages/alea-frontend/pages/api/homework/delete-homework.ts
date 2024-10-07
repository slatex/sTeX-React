import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfPostOrSetError, executeAndEndSet500OnError } from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const { homeworkId } = req.body;
  if (!homeworkId) {
    return res.status(400).json({ message: 'homeworkId is required' });
  }

  const result = await executeAndEndSet500OnError(
    'DELETE FROM homework WHERE homeworkId = ?',
    [homeworkId],
    res
  );
  if (!result) return;
  res.status(200).json({ message: 'Homework deleted successfully!' });
}
