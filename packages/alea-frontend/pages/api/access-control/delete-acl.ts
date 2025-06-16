import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfPostOrSetError, executeTxnAndEndSet500OnError } from '../comment-utils';
import { isCurrentUserMemberOfAClupdater } from '../acl-utils/acl-common-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const id = req.body.id as string;
  if (!id || typeof id !== 'string') return res.status(422).send('Missing id.');
  if (!(await isCurrentUserMemberOfAClupdater(id, res, req))) return res.status(403).end();
  const result = await executeTxnAndEndSet500OnError(
    res,
    'DELETE FROM AccessControlList WHERE id=?',
    [id],
    'DELETE FROM ACLMembership WHERE parentACLId=?',
    [id]
  );
  if (!result) return;
  res.status(200).end();
}
