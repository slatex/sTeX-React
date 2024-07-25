import { AccessControlList } from '@stex-react/api';
import { executeAndEndSet500OnError, getUserIdOrSetError } from '../comment-utils';
import { CACHE_STORE } from './cache-store';

export enum AclSavePostfix {
  acl = 'acls',
  members = 'members',
}
export function getCacheKey(aclId: string, savePostfix: AclSavePostfix) {
  return `${aclId}-${savePostfix}`;
}
export async function isMemberOfAcl(acl: string, userId: string) {
  return await CACHE_STORE.isMemberOfSet(getCacheKey(acl, AclSavePostfix.members), userId);
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
