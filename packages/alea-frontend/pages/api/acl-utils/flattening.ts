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
    if (output.size !== 0) await this._cacheStore.addToSet(keyName, Array.from(output));
    return Array.from(output);
  }
  public async findACL(aclId: string): Promise<string[]> {
    const keyName = getCacheKey(aclId, AclSavePostfix.acl);
    if (this._alreadyComputed.includes(aclId))
      return (await this._cacheStore.getFromSet(keyName)) as string[];

    const output: Set<string> = new Set<string>();
    const acls = this._aclMembership.filter((c) => c.parentACLId === aclId && !c.memberUserId);
    for (const acl of acls) {
      output.add(acl.memberACLId);

      // don't recurse if there is a depend-on-each-other loop
      if (!this._ancestorChain.has(acl.memberACLId)) {
        this._ancestorChain.add(acl.memberACLId);
        for (const treeMember of await this.findACL(acl.memberACLId)) {
          output.add(treeMember);
        }
      }
    }
    this._ancestorChain.delete(aclId);
    this._alreadyComputed.push(aclId);
    if (output.size !== 0) await this._cacheStore.addToSet(keyName, Array.from(output));
    return Array.from(output);
  }
}

export interface ACLMembership {
  id: number;
  memberUserId: string;
  memberACLId: string;
  parentACLId: string;
}
