import { PostSnippet } from '@stex-react/api';
import { NextApiRequest, NextApiResponse } from 'next';
import { executeDontEndSet500OnError } from '../comment-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const posts: PostSnippet[] = await executeDontEndSet500OnError(
    `SELECT postId, title, SUBSTRING(body, 1, 100) AS bodySnippet, authorName, createdAt 
    FROM BlogPosts
    ORDER BY createdAt DESC`,
    [],
    res
  );

  res.status(200).json(posts);
}
