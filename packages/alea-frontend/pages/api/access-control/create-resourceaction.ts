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
  const userId = await getUserIdOrSetError(req, res);
  const { aclId, resourceId, actionId } = req.body;
  if (!aclId || !resourceId || !actionId)
    return res.status(422).send('Missing required fields');
  if (!(await isMemberOfAcl('sys-org', userId as string))) {
    return res.status(403).send('unauthorized');
  }
  const query = `SELECT resourceId, actionId, aclId FROM resourceaccess WHERE resourceId = ? AND actionId = ? AND aclId = ?`;
  const isExists : [{resourceId: string, actionId: string, aclId: string}] = await executeAndEndSet500OnError(query, [resourceId, actionId, aclId], res);
  if(isExists.length>0) return res.status(409).send('already exists');

  const resourceQuery = `INSERT INTO resourceaccess (aclId, resourceId, actionId) VALUES (?, ?, ?)`;
  const result = await executeAndEndSet500OnError(
    resourceQuery,
    [aclId, resourceId, actionId],
    res
  );
  if (!result) return;
  res.status(200).send('created');
}
