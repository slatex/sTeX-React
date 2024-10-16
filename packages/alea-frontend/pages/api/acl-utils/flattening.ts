import { AbstractCacheStore } from './abstract-cache-store';
import { getCacheKey } from './acl-common-utils';

export class Flattening {
  private _alreadyComputed: string[] = [];
  constructor(
    private readonly _aclMembership: ACLMembership[],
    private _cacheStore: AbstractCacheStore
  ) {}

  public async cacheAndGetFlattenedMembers(aclId: string, ancestorChain: string[] = []) {
    const keyName = getCacheKey(aclId);
    if (this._alreadyComputed.includes(aclId))
      return (await this._cacheStore.getFromSet(keyName)) as string[];
    const members = this._aclMembership.filter((c) => c.parentACLId === aclId);
    const memberSet: Set<string> = new Set<string>();
    for (const member of members) {
      if (member.memberUserId) {
        memberSet.add(member.memberUserId);
      } else {
        const childACLId = member.memberACLId;
        if (childACLId && !ancestorChain.includes(childACLId)) {
          const childMembers = await this.cacheAndGetFlattenedMembers(childACLId, [
            ...ancestorChain,
            aclId,
          ]);
          for (const m of childMembers) memberSet.add(m);
        }
      }
    }
    const memberList = Array.from(memberSet);
    await this._cacheStore.addToSet(keyName, memberList);
    return memberList;
  }
}

export interface ACLMembership {
  id: number;
  memberUserId: string;
  memberACLId: string;
  parentACLId: string;
}
