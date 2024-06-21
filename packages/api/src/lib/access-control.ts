export interface AccessControlList {
    id: string;
    description: string;
    isOpen: boolean;
    updaterACLId: string;
    createdAt: string;
    updatedAt: string;
    memberUserIds: string[];
    memberACLIds: string[];
}
