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
    return res.status(400).send('unauthorized');
  }
  const resourceQuery = `INSERT INTO resourceaccess (aclId, resourceId, actionId) VALUES (?, ?, ?)`;
  await executeAndEndSet500OnError(
    resourceQuery,
    [aclId, resourceId, actionId],
    res
  );
  return res.status(200).send('created');
}
