import { Blog } from '@stex-react/api';
import { executeDontEndSet500OnError } from './comment-utils';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const blogs: Blog[] = await executeDontEndSet500OnError(
    `SELECT * FROM blogs ORDER BY id DESC`,
    [],
    res
  );

  res.status(200).json(blogs);
}
