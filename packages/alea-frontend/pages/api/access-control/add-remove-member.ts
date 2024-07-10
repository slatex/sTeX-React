import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfPostOrSetError,
  executeAndEndSet500OnError
} from '../comment-utils';
import { AccessControlList } from '@stex-react/api';
import { isCurrentUserMemberOfAClupdater } from '../acl-utils/acl-common-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!checkIfPostOrSetError(req, res)) return;
  const memberId = req.body.memberId as string;
  const aclId = req.body.memberId as string;
  const isAclMember = req.body.isAclMember as boolean;
  const toBeAdded = req.body.toBeAdded as boolean;

  if (!aclId || !memberId || isAclMember === null || toBeAdded === null) {
    return res.status(422).send('Missing fields.');
  }
  const acl: AccessControlList = (await executeAndEndSet500OnError('select isOpen from AccessControlList where id=?', [aclId], res))[0];
  // check if in updaterACL or (1) isOpen for self-additions (2) is self deletion
  let query = '';
  let params: string[] = [];
  if (toBeAdded) {
    if (!(acl.isOpen || await isCurrentUserMemberOfAClupdater(aclId, res, req)))
      return res.status(403).end();
    query =
      'INSERT INTO ACLMembership (parentACLId, memberACLId, memberUserId) VALUES (?, ?, ?)';
    params = isAclMember ? [aclId, memberId, null] : [aclId, null, memberId];
  } else {
    if (! await isCurrentUserMemberOfAClupdater(aclId, res, req))
      return res.status(403).end();
    const memberField = isAclMember ? 'memberACLId' : 'memberUserId';
    query = `DELETE FROM ACLMembership WHERE parentACLId=? AND ${memberField} = ?`;
    params = [aclId, memberId];
  }
  await executeAndEndSet500OnError(query, params, res);
  res.status(200).end();
}
