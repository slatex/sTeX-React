import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfGetOrSetError,
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';
import { isMemberOfAcl } from '../acl-utils/acl-common-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!checkIfGetOrSetError(req, res)) return;
  const { resourceId, actionId } = req.query;
  if (!resourceId || !actionId) return res.status(422).send(`Missing params.`);
  const userId = await getUserIdOrSetError(req, res);
  const aclQuery = `SELECT aclId FROM resourceaccess WHERE resourceId = ? AND actionId = ?`;
  const acl = await executeAndEndSet500OnError(
    aclQuery,
    [resourceId, actionId],
    res
  );
  return res.send(await isMemberOfAcl(acl[0].aclId, userId));
}
