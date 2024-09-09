import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfPostOrSetError,
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  const { id } = req.body;
  await executeAndEndSet500OnError(`Delete From Grading Where checkerId=? and id=?`, [userId, id], res);
  res.status(200).end()
}
