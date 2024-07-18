import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfPostOrSetError,
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';
import { isMemberOfAcl } from '../acl-utils/acl-common-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!checkIfPostOrSetError(req, res)) return;
  const { aclId, resourceId, actionId } = req.body;
  const userId = await getUserIdOrSetError(req, res);
  if (!(await isMemberOfAcl('sys-org', userId))) {
    return res.status(400).send('not valid');
  }
  if (!aclId || !resourceId || !actionId)
    return res.status(422).send(`Missing params.`);
  const query = `UPDATE resourceaccess SET aclId = ? WHERE resourceId = ? and actionId = ?`;
  await executeAndEndSet500OnError(query, [aclId, resourceId, actionId], res);
  res.status(200).send('updated');
}
