import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfPostOrSetError,
  executeAndEndSet500OnError,
} from '../comment-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!checkIfPostOrSetError(req, res)) return;
  const memberId = req.body.memberId as string;
  const aclId = req.body.memberId as string;
  const isAclMember = req.body.isAclMember as boolean;
  const toBeAdded = req.body.toBeAdded as boolean;
  if (!aclId || !memberId || isAclMember === null || toBeAdded === null) {
    return res.status(422).send('Missing fields.');
  }
  // check if in updaterACL or (1) isOpen for self-additions (2) is self deletion
  let query = '';
  let params: string[] = [];
  if (toBeAdded) {
    query =
      'INSERT INTO ACLMembership (parentACLId, memberACLId, memberUserId) VALUES (?, ?, ?)';
    params = isAclMember ? [aclId, memberId, null] : [aclId, null, memberId];
  } else {
    const memberField = isAclMember ? 'memberACLId' : 'memberUserId';
    query = `DELETE FROM ACLMembership WHERE parentACLId=? AND ${memberField} = ?`;
    params = [aclId, memberId];
  }
  await executeAndEndSet500OnError(query, params, res);
  res.status(200).end();
}
