import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfPostOrSetError,
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';
import { canUpdateAccessControlEntries } from './resource-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const { aclId, resourceId, actionId } = req.body;
  const userId = await getUserIdOrSetError(req, res);
  if (!aclId || !resourceId || !actionId) return res.status(422).send('Missing params.');
  if (!(await canUpdateAccessControlEntries(res, resourceId, userId)))
    return res.status(403).send('unauthorized');

  const query = `
    INSERT INTO ResourceAccess (aclId, resourceId, actionId)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE aclId = VALUES(aclId)
  `;
  const result = await executeAndEndSet500OnError(query, [aclId, resourceId, actionId], res);
  if (!result) return;
  res.status(204).end();
}
