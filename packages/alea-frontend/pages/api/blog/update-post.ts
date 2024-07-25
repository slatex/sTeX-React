import { NextApiRequest, NextApiResponse } from 'next';
import { executeAndEndSet500OnError } from '../comment-utils';
import { Action } from '@stex-react/utils';
import { blogResourceId, getUserIdIfAuthorizedOrSetError } from '../access-control/resource-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = await getUserIdIfAuthorizedOrSetError(req, res, blogResourceId(), Action.UPDATE);
  if (!userId) return res.status(403).send({ message: 'unauthorized' });

  const { title, body, postId, heroImageId, heroImageUrl, heroImagePosition } = req.body;
  const result = await executeAndEndSet500OnError(
    `UPDATE BlogPosts SET title = ?, body = ?, heroImageId = ?, heroImageUrl = ? , heroImagePosition = ? WHERE postId = ?`,
    [title, body, heroImageId ?? null, heroImageUrl ?? null, heroImagePosition ?? null, postId],
    res
  );

  if (!result) return;
  res.status(201).json({ message: 'Blog post updated successfully' });
}
