import { NextApiResponse } from "next";
import { executeAndEndSet500OnError } from "../comment-utils";
import { addSet, getSet } from "./redis-connection-utils";

export class Flattening {
    private _aclMemberWantToSearch: Set<string> = new Set<string>();
    private _aclMemberlisted: string[] = [];
    private _aclsWantToSearch: Set<string> = new Set<string>();
    private _aclslisted: string[] = [];
    constructor (private res: NextApiResponse) {
    }
    public async findMembers(AclId: string): Promise<string[]> {
        const output: Set<string> = new Set<string>();
        if (this._aclMemberlisted.includes(AclId))
            return (await getSet(AclId)) as string[];
        const members = await executeAndEndSet500OnError<ACLMembership[]>('select * from ACLMembership where parentACLId=?', [AclId], this.res);
        for (const member of members.filter(c => c.memberUserId)) {
            output.add(member.memberUserId);
        }
        const acls = members.filter(c => c.memberACLId);
        for (const acl of acls) {
            if (!this._aclMemberWantToSearch.has(AclId)) {// break deepend on each other loop
                if (!this._aclMemberlisted.includes(AclId))
                    this._aclMemberWantToSearch.add(AclId);
                for (const treeMember of (await this.findMembers(acl.memberACLId))) {
                    output.add(treeMember);
                }
            }
        }
        this._aclMemberWantToSearch.delete(AclId);
        this._aclMemberlisted.push(AclId);
        if (output.size != 0)
            await addSet(AclId, Array.from(output));
        return Array.from(output);
    }
    public async findACL(AclId: string) {
        const output: Set<string> = new Set<string>();
        if (this._aclMemberlisted.includes(AclId))
            return (await getSet(`${AclId}-acl`)) as string[];
        const acls = await executeAndEndSet500OnError<ACLMembership[]>('select * from ACLMembership where parentACLId=? AND memberUserId is null', [AclId], this.res);
        for (const acl of acls) {
            if (!this._aclsWantToSearch.has(AclId)) {// break deepend on each other loop
                if (!this._aclslisted.includes(AclId))
                    this._aclsWantToSearch.add(AclId);
                for (const treeMember of (await this.findACL(acl.memberACLId))) {
                    output.add(treeMember);
                }
            }
        }
        this._aclsWantToSearch.delete(AclId);
        this._aclslisted.push(AclId);
        if (output.size != 0)
            await addSet(AclId, Array.from(output));
        return Array.from(output);
    }
};
export interface ACLMembership {
    id: number;
    memberUserId: string;
    memberACLId: string;
}