import { NextApiRequest, NextApiResponse } from 'next';
import {
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from './comment-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;

  const results = await executeAndEndSet500OnError(
    'DELETE FROM notifications WHERE userId = ?',
    [userId],
    res
  );

  if (!results) return;

  res.status(200).json({ message: 'User notifications deleted successfully' });
}
