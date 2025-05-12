import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfPostOrSetError, executeAndEndSet500OnError } from '../comment-utils';
import { getUserIdIfAuthorizedOrSetError } from '../access-control/resource-utils';
import { Action, CURRENT_TERM, ResourceName } from '@stex-react/utils';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const { orgId, email } = req.body;
  console.log({ orgId });
  console.log({ email });
  const inviterId = await getUserIdIfAuthorizedOrSetError(
    req,
    res,
    ResourceName.JOB_PORTAL_ORG,
    Action.CREATE_JOB_POST,
    { orgId: orgId, instanceId: CURRENT_TERM }
  );
  if (!inviterId) return;
  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'Invalid or missing email' });
    return;
  }
  const result = await executeAndEndSet500OnError(
    `INSERT INTO OrgInvitations (inviteruserId, inviteeEmail,organizationId) VALUES (?, ?, ?)`,
    [inviterId, email, orgId],
    res
  );

  if (!result) return;
  res.status(201).end();
}
