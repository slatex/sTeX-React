import { AccessControlList } from '@stex-react/api';
import { NextApiRequest, NextApiResponse } from 'next';
import { executeAndEndSet500OnError, executeDontEndSet500OnError } from '../comment-utils';
import { ACLMembership } from './acl-membership';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string;
  if (!id) return res.status(422).send(`Missing param id.`);
  const acls: any[] = await executeAndEndSet500OnError(
    `SELECT * FROM AccessControlList where id = ?`,
    [id],
    res
  );
  const dbAcl = acls?.[0];
  if (!dbAcl) return res.status(404).send(`No ACL with id [${id}].`);

  const members: ACLMembership[] = await executeAndEndSet500OnError(
    'SELECT * FROM ACLMembership WHERE parentACLId = ?',
    [id],
    res
  );
  const directMembers = members.map((m) => m.memberUserId).filter((u) => u);
  if (directMembers.length === 0) {
    return res.status(200).send([]);
  }
  const result: { firstname: string; lastname: string; userId: string }[] =
    await executeDontEndSet500OnError(
      `select firstname, lastname, userId from userInfo where userId IN (?)`,
      [directMembers],
      res
    );
  res
    .status(200)
    .send(result.map((c) => ({ fullName: `${c.firstname} ${c.lastname}`, userId: `${c.userId}` })));
}
