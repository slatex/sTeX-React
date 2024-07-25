import { Action, blogResourceId } from '@stex-react/utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserIdIfAuthorizedOrSetError } from '../access-control/resource-utils';
import { executeAndEndSet500OnError } from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = await getUserIdIfAuthorizedOrSetError(req, res, blogResourceId(), Action.DELETE);
  if (!userId) return res.status(403).send({ message: 'unauthorized' });

  const { postId } = req.body;
  const result = await executeAndEndSet500OnError(
    `DELETE FROM BlogPosts WHERE postId = ?`,
    [postId],
    res
  );

  if (!result) return;
  res.status(200).json({ message: 'Post deleted successfully' });
}
