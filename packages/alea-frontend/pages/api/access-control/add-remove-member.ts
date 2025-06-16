import { AccessControlList } from '@stex-react/api';
import { NextApiRequest, NextApiResponse } from 'next';
import { isCurrentUserMemberOfAClupdater } from '../acl-utils/acl-common-utils';
import {
  checkIfPostOrSetError,
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';
import { recomputeMemberships } from './recompute-memberships';

export async function addRemoveMember(
  {
    memberId,
    aclId,
    isAclMember,
    toBeAdded,
  }: { memberId: string; aclId: string; isAclMember: boolean; toBeAdded: boolean },
  req: NextApiRequest,
  res: NextApiResponse
): Promise<any> {
  const userId = await getUserIdOrSetError(req, res);
  if (!aclId || !memberId || isAclMember === null || toBeAdded === null) {
    return { status: 422, message: 'Missing fields' };
  }
  const acl: AccessControlList = (
    await executeAndEndSet500OnError(
      'select isOpen from AccessControlList where id=?',
      [aclId],
      res
    )
  )[0];
  // check if in updaterACL or (1) isOpen for self-additions (2) is self deletion
  let query = '';
  let params: string[] = [];
  if (toBeAdded) {
    if (!(acl?.isOpen || (await isCurrentUserMemberOfAClupdater(aclId, res, req))))
      return { status: 403 };
    if (isAclMember) query = 'select id from AccessControlList where id=?';
    else query = 'select userId from userInfo where userId=?';
    const itemsExist = (await executeAndEndSet500OnError(query, [memberId], res))[0];
    if (itemsExist?.length) return { status: 422, message: 'Invalid Inputs' };
    query = 'INSERT INTO ACLMembership (parentACLId, memberACLId, memberUserId) VALUES (?, ?, ?)';
    params = isAclMember ? [aclId, memberId, null] : [aclId, null, memberId];
  } else {
    if (!(await isCurrentUserMemberOfAClupdater(aclId, res, req)) && memberId != userId)
      return { status: 403 };
    const memberField = isAclMember ? 'memberACLId' : 'memberUserId';
    query = `DELETE FROM ACLMembership WHERE parentACLId=? AND ${memberField} = ?`;
    params = [aclId, memberId];
  }
  await executeAndEndSet500OnError(query, params, res);
  await recomputeMemberships();
  return { status: 200 };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const { memberId, aclId, isAclMember, toBeAdded } = req.body;
  const result = await addRemoveMember({ memberId, aclId, isAclMember, toBeAdded }, req, res);
  if (result?.message) res.status(result.status).send(result?.message);
  else res.status(result.status).end();
}
