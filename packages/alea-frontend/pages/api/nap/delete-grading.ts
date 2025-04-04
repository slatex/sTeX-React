import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfPostOrSetError,
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;
  const { id } = req.body;
  await executeAndEndSet500OnError(`DELETE FROM Grading WHERE checkerId=? AND id=?`, [userId, id], res);
  res.status(200).end()
}
