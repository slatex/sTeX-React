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
  if (!(await isMemberOfAcl('sys-org', userId))) {
    return res.status(400).send('not valid');
  }
  const { resourceId, actionId } = req.body;
  if (!resourceId) return res.status(422).send('Missing resourceId');
  const query = `DELETE FROM resourceaccess WHERE resourceId = ? and actionId = ?`;
  await executeAndEndSet500OnError(query, [resourceId, actionId], res);
  return res.status(200).send('deleted');
}
