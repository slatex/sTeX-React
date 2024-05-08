import { NextApiRequest, NextApiResponse } from 'next';
import {
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from './comment-utils';
import { isModerator } from '@stex-react/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;
  if (!isModerator(userId)) {
    res.status(403).send({ message: 'Unauthorized.' });
    return;
  }

  const { blogId } = req.body;

  const result = await executeAndEndSet500OnError(
    `DELETE FROM blogs WHERE blogId = ?`,
    [blogId],
    res
  );

  if (!result) return;
  res.status(200).json({ message: 'Blog deleted successfully' });
}
