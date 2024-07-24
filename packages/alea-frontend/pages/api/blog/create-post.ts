import { NextApiRequest, NextApiResponse } from 'next';
import { executeAndEndSet500OnError, executeQuery } from '../comment-utils';
import { Action, blogResourceId, getUserIdIfAuthorizedOrSetError } from '../resource-action-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const resourceId = blogResourceId();
  const userId = await getUserIdIfAuthorizedOrSetError(req, res, resourceId, Action.CREATE);
  if (!userId) return res.status(403).send({ message: 'unauthorized' });
  const { title, body, postId } = req.body;
  const userName = await executeQuery(`SELECT firstName, lastName FROM userInfo WHERE userId = ?`, [
    userId,
  ]);
  const authorName = userName[0].firstName + ' ' + userName[0].lastName;
  const result = await executeAndEndSet500OnError(
    `INSERT INTO BlogPosts (title, body, postId, authorId, authorName) VALUES (?, ?, ?, ?, ?)`,
    [title, body, postId, userId, authorName],
    res
  );

  if (!result) return;
  res.status(201).json({ message: 'Blog post created successfully' });
}
