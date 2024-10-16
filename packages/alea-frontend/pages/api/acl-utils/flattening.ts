import { AbstractCacheStore } from './abstract-cache-store';
import { AclSavePostfix, getCacheKey } from './acl-common-utils';

export class Flattening {
  private _ancestorChain: Set<string> = new Set<string>();
  private _alreadyComputed: string[] = [];
  constructor(
    private readonly _aclMembership: ACLMembership[],
    private _cacheStore: AbstractCacheStore
  ) {}
  public async findMembers(AclId: string): Promise<string[]> {
    const output: Set<string> = new Set<string>();
    const keyName = getCacheKey(AclId, AclSavePostfix.members);
    const allAcls = await this.findACL(AclId);
    allAcls.push(AclId);
    const members = this._aclMembership.filter(
      (c) => c.memberUserId && allAcls.includes(c.parentACLId)
    );
    for (const member of members.filter((c) => c.memberUserId)) {
      output.add(member.memberUserId);
    }
    if (output.size != 0) await this._cacheStore.addToSet(keyName, Array.from(output));
    return Array.from(output);
  }
  public async findACL(AclId: string): Promise<string[]> {
    const output: Set<string> = new Set<string>();
    const KeyName = getCacheKey(AclId, AclSavePostfix.acl);
    if (this._alreadyComputed.includes(AclId))
      return (await this._cacheStore.getFromSet(KeyName)) as string[];
    const acls = this._aclMembership.filter((c) => c.parentACLId && !c.memberUserId);
    for (const acl of acls) {
      output.add(acl.memberACLId);
      if (!this._ancestorChain.has(acl.memberACLId)) {
        // break deepend on each other loop
        this._ancestorChain.add(acl.memberACLId);
        for (const treeMember of await this.findACL(acl.memberACLId)) {
          output.add(treeMember);
        }
      }
    }
    this._ancestorChain.delete(AclId);
    this._alreadyComputed.push(AclId);
    if (output.size != 0) await this._cacheStore.addToSet(KeyName, Array.from(output));
    return Array.from(output);
  }
}
export interface ACLMembership {
  id: number;
  memberUserId: string;
  memberACLId: string;
  parentACLId: string;
}
s