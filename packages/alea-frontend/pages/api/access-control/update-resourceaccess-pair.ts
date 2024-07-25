import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfPostOrSetError,
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';
import { isMemberOfAcl } from '../acl-utils/acl-common-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const { aclId, resourceId, actionId } = req.body;
  const userId = await getUserIdOrSetError(req, res);
  if (!(await isMemberOfAcl('sys-admin', userId))) {
    res.status(403).send({ message: 'not valid' });
  }
  if (!aclId || !resourceId || !actionId) res.status(422).send(`Missing params.`);
  const query = `UPDATE ResourceAccess SET aclId = ? WHERE resourceId = ? and actionId = ?`;
  const result = await executeAndEndSet500OnError(query, [aclId, resourceId, actionId], res);
  if (!result) return;
  res.status(200).send({ message: 'updated' });
}
