import { AccessControlList } from '@stex-react/api';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfPostOrSetError,
  executeAndEndSet500OnError,
  executeTxnAndEndSet500OnError,
} from '../comment-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!checkIfPostOrSetError(req, res)) return;
  const acl = req.body as AccessControlList;

  const { id, description, isOpen, updaterACLId, memberUserIds, memberACLIds } =
    acl;
  if (
    !id ||
    !description ||
    !updaterACLId ||
    isOpen == null ||
    !memberUserIds ||
    !memberACLIds
  ) {
    return res.status(422).send('Missing required fields.');
  }
  const membersCount = (await executeAndEndSet500OnError<[]>('select userId from userInfo where userId in (?)', [memberUserIds], res)).length;
  const aclCount = (await executeAndEndSet500OnError<[]>('select id from AccessControlList where id in (?)', [memberACLIds], res)).length;
  if (membersCount != memberUserIds.length || aclCount != memberACLIds.length)
    return res.status(422).send('Invalid item');
  const updaterId = req.body.updaterId ?? id;
  const numMembershipRows = memberUserIds.length + memberACLIds.length;
  const values = new Array(numMembershipRows).fill('(?, ?, ?)');

  const memberQueryParams = [];
  for (const userId of memberUserIds) memberQueryParams.push(id, null, userId);
  for (const aclId of memberACLIds) memberQueryParams.push(id, aclId, null);

  const memberQuery = `INSERT INTO ACLMembership (parentACLId, memberACLId, memberUserId) VALUES 
  ${values.join(', ')}`;

  await executeTxnAndEndSet500OnError(
    res,
    'INSERT INTO AccessControlList (id, description, updaterACLId, isOpen) VALUES (?,?, ?,?)',
    [id, description, updaterId, isOpen],
    memberQuery,
    memberQueryParams
  );

  res.status(201).end();
}
