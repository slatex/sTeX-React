import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfPostOrSetError,
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';
import { canUpdateAccessControlEntries } from './resource-utils';
import { recomputeMembership } from './recompute-memberships';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  const { resourceId, actionId } = req.body;
  if (!(await canUpdateAccessControlEntries(res, resourceId, userId))) {
    return res.status(403).send('unauthorized');
  }
  if (!resourceId) return res.status(422).send('Missing resourceId');
  const query = `DELETE FROM ResourceAccess WHERE resourceId = ? and actionId = ?`;
  const result = await executeAndEndSet500OnError(query, [resourceId, actionId], res);
  if (!result) return;
  recomputeMembership();
  return res.status(200).send({ message: 'deleted' });
}
