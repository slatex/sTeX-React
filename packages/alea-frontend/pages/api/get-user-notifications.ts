import { NextApiRequest, NextApiResponse } from 'next';
import {
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from './comment-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (process.env.NEXT_PUBLIC_SITE_VERSION === 'production') {
    res.status(200).send([]);
    return;
  }
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;
  const results = await executeAndEndSet500OnError(
    `SELECT * FROM notifications where userId=?`,
    [userId],
    res
  );
  if (!results) return;

  res.status(200).send(results);
}
