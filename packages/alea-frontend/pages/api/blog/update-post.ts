import { NextApiRequest, NextApiResponse } from 'next';
import { executeAndEndSet500OnError } from '../comment-utils';
import { Action, blogResourceId, getUserIdIfAuthorizedOrSetError } from '../resource-action-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = await getUserIdIfAuthorizedOrSetError(req, res, blogResourceId(), Action.UPDATE);
  if (!userId) return res.status(403).send({ message: 'unauthorized' });

  const { title, body, postId } = req.body;
  const result = await executeAndEndSet500OnError(
    `UPDATE BlogPosts SET title = ?, body = ? WHERE postId = ?`,
    [title, body, postId],
    res
  );

  if (!result) return;
  res.status(201).json({ message: 'Blog post updated successfully' });
}
