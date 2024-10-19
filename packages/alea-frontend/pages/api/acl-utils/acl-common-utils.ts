import { AccessControlList } from '@stex-react/api';
import { executeAndEndSet500OnError, getUserIdOrSetError } from '../comment-utils';
import { CACHE_STORE } from './cache-store';
import { NextApiResponse } from 'next';

export function getCacheKey(aclId: string) {
  return `acl-membership:${aclId}`;
}

export async function isMemberOfAcl(acl: string, userId: string) {
  return await CACHE_STORE.isMemberOfSet(getCacheKey(acl), userId);
}

export async function isCurrentUserMemberOfAClupdater(aclId: string, res, req): Promise<boolean> {
  const userId = await getUserIdOrSetError(req, res);
  if(!userId) return false;
  const acl: AccessControlList = (
    await executeAndEndSet500OnError(
      'select updaterACLId from AccessControlList where id=?',
      [aclId],
      res
    )
  )[0];
  return await isMemberOfAcl(acl.updaterACLId, userId);
}

export async function validateMemberAndAclIds(
  res : NextApiResponse,
  memberUserIds, 
  memberACLIds
){
  const memberCount = memberUserIds.length ? (
    await executeAndEndSet500OnError<[]>(
      'select userId from userInfo where userId in (?)',
      [memberUserIds],
      res
    )
  ).length :
  0;
  const aclCount = memberACLIds.length ? (
    await executeAndEndSet500OnError<[]>(
      'select id from AccessControlList where id in (?)',
      [memberACLIds],
      res
    )
  ).length : 
  0;
  if (memberCount !== memberUserIds.length || aclCount !== memberACLIds.length)
    return false;
  return true;
}
