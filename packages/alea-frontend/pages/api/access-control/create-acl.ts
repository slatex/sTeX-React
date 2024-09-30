import { AccessControlList } from '@stex-react/api';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfPostOrSetError,
  executeAndEndSet500OnError,
} from '../comment-utils';
import { validateMemberAndAclIds } from '../acl-utils/acl-common-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const acl = req.body as AccessControlList;

  const { id, description, isOpen, updaterACLId, memberUserIds, memberACLIds } = acl;

  if (
    !id ||
    !updaterACLId ||
    isOpen === null ||
    isOpen === undefined ||
    !memberUserIds ||
    !memberACLIds
  ) {
    return res.status(422).send('Missing required fields.');
  }
  if (!(await validateMemberAndAclIds(res, memberUserIds, memberACLIds)))
    return res.status(422).send('Invalid items');
  const updaterId = req.body.updaterACLId ?? id;
  await executeAndEndSet500OnError(
    'INSERT INTO AccessControlList (id, description, updaterACLId, isOpen) VALUES (?,?, ?,?)',
    [id, description, updaterId, isOpen],
    res
  );

  // here i am doing this because when ever there is a empty array, it causing error
  const numMembershipRows = memberUserIds.length + memberACLIds.length;
  if (numMembershipRows > 0) {
    const values = new Array(numMembershipRows).fill('(?, ?, ?)');
    const memberQueryParams = [];
    for (const userId of memberUserIds) memberQueryParams.push(id, null, userId);
    for (const aclId of memberACLIds) memberQueryParams.push(id, aclId, null);
    const memberQuery = `INSERT INTO ACLMembership (parentACLId, memberACLId, memberUserId) VALUES 
    ${values.join(', ')}`;
    await executeAndEndSet500OnError(memberQuery, memberQueryParams, res);
  }
  res.status(201).end();
}
