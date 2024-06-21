import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfPostOrSetError,
  executeAndEndSet500OnError,
  executeTxnAndEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!checkIfPostOrSetError(req, res)) return;
  const userId = getUserIdOrSetError(req, res);
  if (!userId) return;

  const { id, description, isOpen } = req.body;
  if (!id || !description || isOpen == null) {
    return res.status(422).send('Missing required fields.');
  }
  const memberIds = req.body.memberIds ?? [];
  const memberAcls = req.body.memberAcls ?? [];

  // Check that memberIds and memberACLs are valid arrays
  const updaterId = req.body.updaterId ?? id;
  const values = new Array(memberIds.length + memberAcls.length).fill(
    '(?, ?, ?)'
  );

  const memberQueryParams = [];
  for (const userId of memberIds) memberQueryParams.push(id, null, userId);
  for (const aclId of memberAcls) memberQueryParams.push(id, aclId, null);

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
