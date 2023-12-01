import { NextApiRequest, NextApiResponse } from 'next';
import {
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from './comment-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;
  const result: Array<any> = await executeAndEndSet500OnError(
    `SELECT notificationSeenTs from userInfo where userId=?`,
    [userId],
    res
  );
  if (!result || result.length === 0) {
    res.status(200).send('');
    return;
  }
  res.status(200).send(result[0].notificationSeenTs);
}
