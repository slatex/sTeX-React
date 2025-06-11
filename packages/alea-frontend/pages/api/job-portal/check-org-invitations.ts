import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfGetOrSetError, executeDontEndSet500OnError } from '../comment-utils';
export async function checkInviteToOrg(
  organizationId: string,
  email: string,
  res: NextApiResponse
) {
  if (!organizationId || !email) return;
  const result: any = await executeDontEndSet500OnError(
    `SELECT COUNT(*) AS count FROM orgInvitations WHERE organizationId = ? AND inviteeEmail = ?`,
    [organizationId, email],
    res
  );
  if (!result || !result.length) {
    return { hasInvites: false };
  }
  const count = result[0].count;
  return { hasInvites: count > 0 };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res)) return;
  const { organizationId, email } = req.query;
  const inviteStatus = await checkInviteToOrg(organizationId as string, email as string, res);
  return res.status(200).json(inviteStatus);
}
