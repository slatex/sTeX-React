import { NextApiRequest, NextApiResponse } from 'next';
import { executeAndEndSet500OnError, getUserIdOrSetError } from '../comment-utils';
import { isModerator } from '@stex-react/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;
  if (!isModerator(userId)) {
    return res.status(403).send({ message: 'Unauthorized.' });
  }
  const { title, body, postId, heroImageId, heroImageUrl } = req.body;
  const result = await executeAndEndSet500OnError(
    `UPDATE BlogPosts SET title = ?, body = ?, heroImageId = ?, heroImageUrl = ? WHERE postId = ?`,
    [title, body, heroImageId ?? null, heroImageUrl ?? null, postId],
    res
  );

  if (!result) return;
  res.status(201).json({ message: 'Blog post updated successfully' });
}
