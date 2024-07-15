import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfPostOrSetError,
  executeAndEndSet500OnError,
} from '../comment-utils';
import { isCurrentUserMemberOfAClupdater } from '../acl-utils/acl-common-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!checkIfPostOrSetError(req, res)) return;

  const { id, description, isOpen, memberUserIds, memberACLIds,   updaterACLId } = req.body;
  if (!id || !description || !updaterACLId){
    return res.status(422).send('Missing required fields.');
  }
  if (!await isCurrentUserMemberOfAClupdater(id, res, req))
    return res.status(403).end();
  await executeAndEndSet500OnError(
    'UPDATE AccessControlList SET description=?, updaterACLId=?, isOpen=? WHERE id=?',
    [description, updaterACLId, !!isOpen, id],
    res
  );
  return res.status(204).end();
}
