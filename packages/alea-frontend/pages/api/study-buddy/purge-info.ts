import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfTypeOrSetError,
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!checkIfTypeOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;

  const results1 = await executeAndEndSet500OnError(
    'DELETE FROM StudyBuddyConnections WHERE senderId=? OR receiverId=?',
    [userId, userId],
    res
  );
  if (!results1) return;

  const results2 = await executeAndEndSet500OnError(
    'DELETE FROM StudyBuddyUsers WHERE userId=?',
    [userId],
    res
  );
  if (!results2) return;
  res.status(204).end();
}
