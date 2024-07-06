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
