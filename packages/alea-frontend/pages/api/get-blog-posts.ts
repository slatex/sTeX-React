import { Blog } from '@stex-react/api';
import { executeDontEndSet500OnError } from './comment-utils';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const blogs: Blog[] = await executeDontEndSet500OnError(
    `SELECT blogId, title, SUBSTRING(body , 1 , 100) AS body, authorName, createdAt FROM Blogs ORDER BY createdAt DESC;`,
    [],
    res
  );

  res.status(200).json(blogs);
}
