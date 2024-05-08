import { NextApiRequest, NextApiResponse } from 'next';
import {
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';
import { isModerator } from '@stex-react/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;
  if (!isModerator(userId)) {
    return res.status(403).send({ message: 'Unauthorized.' });
  }

  const { postId } = req.body;

  const result = await executeAndEndSet500OnError(
    `DELETE FROM BlogPosts WHERE postId = ?`,
    [postId],
    res
  );

  if (!result) return;
  res.status(200).json({ message: 'Post deleted successfully' });
}
