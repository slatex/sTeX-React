import { NextApiRequest, NextApiResponse } from 'next';
import {
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const lan = req.query.locale as string;
  if (process.env.NEXT_PUBLIC_SITE_VERSION === 'production') {
    res.status(200).send([]);
    return;
  }
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;
  let results;
  if (lan == 'en') {
    results = await executeAndEndSet500OnError(
      `SELECT header,content,postedTimestamp,notificationType,link  FROM notifications where userId=?`,
      [userId],
      res
    );
  } else {
    results = await executeAndEndSet500OnError(
      `SELECT header_de as header,content_de as content,postedTimestamp,notificationType,link  FROM notifications where userId=?`,
      [userId],
      res
    );
  }

  if (!results) return;

  res.status(200).send(results);
}
