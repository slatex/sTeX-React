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
  const { title, body, blogid } = req.body;
  const result = await executeAndEndSet500OnError(
    `UPDATE Blogs SET title= ? , body = ?  WHERE blogId = ?`,
    [title, body, blogid],
    res
  );

  if (!result) return;
  res.status(201).json({ message: 'Blog updated successfully' });
}
