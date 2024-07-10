import { AccessControlList } from "@stex-react/api";
import { executeAndEndSet500OnError, getUserIdOrSetError } from "../comment-utils";
import { isMemberOfCachedSet } from "./redis-connection-utils";


export enum AclSavePostfix {
    acl = 'acls',
    members = 'members'
}
export function getRedisName(aclId: string, savePostfix: AclSavePostfix) {
    return `${aclId}-${savePostfix}`;
}
export async function isMemberOfAcl(acl: string, userId: string) {
    return await isMemberOfCachedSet(getRedisName(acl, AclSavePostfix.members), userId);
};
export async function isCurrentUserMemberOfAClupdater(aclId: string, res, req): Promise<boolean> {
    const userId = await getUserIdOrSetError(req, res);
    const acl: AccessControlList = (await executeAndEndSet500OnError('select updaterACLId from AccessControlList where id=?', [aclId], res))[0];
    return await isMemberOfAcl(acl.updaterACLId, userId);
}