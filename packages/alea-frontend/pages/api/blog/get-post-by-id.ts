import { BlogPost } from '@stex-react/api';
import { executeDontEndSet500OnError } from '../comment-utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserIdIfAuthorizedOrSetError } from '../access-control/resource-utils';
import { Action, CURRENT_TERM, ResourceName } from '@stex-react/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = await getUserIdIfAuthorizedOrSetError(
    req,
    res,
    ResourceName.JOB_PORTAL,
    Action.APPLY,
    { instanceId: CURRENT_TERM }
  );
  if (!userId) return;
  const { postId } = req.query;
  const posts: BlogPost[] = await executeDontEndSet500OnError(
    `SELECT * FROM BlogPosts WHERE postId = ?`,
    [postId],
    res
  );
  if (!posts?.length) {
    return res.status(404).json({ message: 'Post not found' });
  }
  res.status(200).json(posts[0]);
}
