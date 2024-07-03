import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfPostOrSetError,
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!checkIfPostOrSetError(req, res)) return;
  const userId = getUserIdOrSetError(req, res);
  if (!userId) return;

  const { id, description, isOpen, memberUserIds, memberACLIds,   updaterACLId } = req.body;

  if (!id || !description || !updaterACLId) {
    return res.status(422).send('Missing required fields.');
  }

  await executeAndEndSet500OnError(
    'UPDATE AccessControlList SET description=?, updaterACLId=?, isOpen=? WHERE id=?',
    [description, updaterACLId, !!isOpen, id],
    res
  );



  return res.status(204).end();
}
