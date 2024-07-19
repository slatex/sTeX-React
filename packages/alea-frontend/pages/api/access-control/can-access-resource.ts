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
  if (!resourceId || !actionId) return res.status(422).send({messge : `Missing params.`});
  const userId = await getUserIdOrSetError(req, res);
  const aclQuery = `SELECT aclId FROM resourceaccess WHERE resourceId = ? AND actionId = ?`;
  const acl : {aclId: string}[] = await executeAndEndSet500OnError(
    aclQuery,
    [resourceId, actionId],
    res
  );
  if(!acl) return;
  if(acl.length == 0) return res.status(404).send({message : 'no entry found'});
  return res.status(200).send(await isMemberOfAcl(acl[0].aclId, userId));
}
