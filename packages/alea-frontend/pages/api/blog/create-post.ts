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
  const { title, body, postId, authorId, authorName, heroImageId, heroImageUrl } = req.body;

  let sqlQuery = `INSERT INTO BlogPosts (title, body, postId, authorId, authorName`
  let addedQuery = `) VALUES (?, ?, ?, ?, ?`;
  let values = [title, body, postId, authorId, authorName];

  if (heroImageId) {
    sqlQuery += `, heroImageId`;
    addedQuery += `, ?`;
    values.push(heroImageId);
  }
  if (heroImageUrl) {
    sqlQuery += `, heroImageUrl`;
    addedQuery += `, ?`;
    values.push(heroImageUrl);
  }

  addedQuery += `)`;
  sqlQuery += addedQuery;


  const result = await executeAndEndSet500OnError(
    sqlQuery,
    values,
    res
  );

  if (!result) return;
  res.status(201).json({ message: 'Blog post created successfully' });
}
