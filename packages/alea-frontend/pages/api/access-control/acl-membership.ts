export interface ACLMembership {
    id: string;
    parentACLId: string;
    memberACLId?: string;
    memberUserId?: string;
    createdAt: string;
}
