import { AccessControlList } from '@stex-react/api';
import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfPostOrSetError, executeAndEndSet500OnError } from '../comment-utils';
import { validateMemberAndAclIds } from '../acl-utils/acl-common-utils';

export async function createAcl(
  acl: {
    id: string;
    description: string;
    isOpen: boolean;
    updaterACLId: string;
    memberUserIds: string[];
    memberACLIds: string[];
  },
  res: NextApiResponse
) {
  const { id, description, isOpen, updaterACLId, memberUserIds, memberACLIds } = acl;

  if (
    !id ||
    !updaterACLId ||
    isOpen === null ||
    isOpen === undefined ||
    !memberUserIds ||
    !memberACLIds
  ) {
    return { status: 422, message: 'Missing required fields.' };
  }
  if (!(await validateMemberAndAclIds(res, memberUserIds, memberACLIds)))
    return { status: 422, message: 'Invalid user or ACL IDs.' };
  const result = await executeAndEndSet500OnError(
    'INSERT INTO AccessControlList (id, description, updaterACLId, isOpen) VALUES (?,?, ?,?)',
    [id, description, updaterACLId, isOpen],
    res
  );
  if (!result) return;

  const numMembershipRows = memberUserIds.length + memberACLIds.length;
  if (numMembershipRows > 0) {
    const values = new Array(numMembershipRows).fill('(?, ?, ?)');
    const memberQueryParams = [];
    for (const userId of memberUserIds) memberQueryParams.push(id, null, userId);
    for (const aclId of memberACLIds) memberQueryParams.push(id, aclId, null);

    const memberQuery = `INSERT INTO ACLMembership (parentACLId, memberACLId, memberUserId) VALUES 
    ${values.join(', ')}`;
    const resp = await executeAndEndSet500OnError(memberQuery, memberQueryParams, res);
    if (!resp) return;
  }
  return { status: 201 };
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const acl = req.body as AccessControlList;
  const { id, description, isOpen, updaterACLId, memberUserIds, memberACLIds } = acl;
  const result = await createAcl(
    {
      id,
      description,
      isOpen,
      updaterACLId: updaterACLId ?? id,
      memberUserIds,
      memberACLIds,
    },
    res
  );
  if (result.message) {
    return res.status(result.status).json({ message: result.message });
  } else {
    return res.status(result.status).end();
  }
}
