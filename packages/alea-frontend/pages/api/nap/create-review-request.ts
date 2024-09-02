import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfPostOrSetError,
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  const [reviewType, answerId] = req.body;
  if (!reviewType || !answerId) return res.status(422).end();

  executeAndEndSet500OnError(
    `INSERT INTO ReviewRequest (reviewType, answerId, userId) VALUES (?,?,?)`,
    [reviewType, answerId, userId],
    res
  );
  res.status(201).end();
}
