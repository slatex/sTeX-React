import { executeAndEndSet500OnError } from "../comment-utils";
import { addSet, getSet } from "./redis-connection-utils";

export class Flattening {
    private _aclsWantToSearch: Set<string> = new Set<string>();
    private _aclslisted: string[] = [];
    private readonly _membersSavePostfix = 'members';
    private readonly _aclsSavePostfix = 'acls';
    constructor (private readonly _aclMembership: ACLMembership[]) {
    }
    public async findMembers(AclId: string): Promise<string[]> {
        const output: Set<string> = new Set<string>();
        const redisName = `${AclId}-${this._membersSavePostfix}`;
        const allAcls = await this.findACL(AclId);
        allAcls.push(AclId);
        const members = this._aclMembership.filter(c=>c.memberUserId && allAcls.includes(c.parentACLId))
        for (const member of members.filter(c => c.memberUserId)) {
            output.add(member.memberUserId);
        }
        if (output.size != 0)
            await addSet(redisName, Array.from(output));
        return Array.from(output);
    }
    public async findACL(AclId: string) {
        const output: Set<string> = new Set<string>();
        const redisName = `${AclId}-${this._aclsSavePostfix}`;
        if (this._aclslisted.includes(AclId))
            return (await getSet(redisName)) as string[];
        const acls = this._aclMembership.filter(c => c.parentACLId&& !c.memberUserId);
        for (const acl of acls) {
            output.add(acl.memberACLId);
            if (!this._aclsWantToSearch.has(acl.memberACLId)) {// break deepend on each other loop
                this._aclsWantToSearch.add(acl.memberACLId);
                for (const treeMember of (await this.findACL(acl.memberACLId))) {
                    output.add(treeMember);
                }
            }
        }
        this._aclsWantToSearch.delete(AclId);
        this._aclslisted.push(AclId);
        if (output.size != 0)
            await addSet(redisName, Array.from(output));
        return Array.from(output);
    }
};
export interface ACLMembership {
    id: number;
    memberUserId: string;
    memberACLId: string;
    parentACLId: string;
}