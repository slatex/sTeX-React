import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfPostOrSetError,
  executeAndEndSet500OnError,
  executeDontEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';
import { Action, CURRENT_TERM, isFauId, ResourceName } from '@stex-react/utils';
import { getUserIdIfAuthorizedOrSetError } from '../access-control/resource-utils';
import { getOrganizationId } from '@stex-react/api';

export async function checkIfUserExistsOnJP(userId: string, res) {
  let tableToCheck;
  if (isFauId(userId)) {
    tableToCheck = 'studentProfile';
  } else {
    tableToCheck = 'recruiterProfile';
  }
  const query = `
    SELECT userId
    FROM ${tableToCheck}
    WHERE userId = ?
  `;
  const results: any[] = await executeDontEndSet500OnError(query, [userId], res);
  return results && results.length > 0;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const { name, email, position, mobile, altMobile, organizationId, about, socialLinks } = req.body;
  const userId = await getUserIdIfAuthorizedOrSetError(
    req,
    res,
    ResourceName.JOB_PORTAL_ORG,
    Action.CREATE_JOB_POST,
    { orgId: organizationId, instanceId: CURRENT_TERM }
  );
  if (!userId) return;
  const userExists = await checkIfUserExistsOnJP(userId, res);
  if (!userExists) return;
  const result = await executeAndEndSet500OnError(
    `UPDATE recruiterProfile 
     SET name = ?, email = ?, position = ?, mobile = ?, altMobile = ?,organizationId=?,about=?,socialLinks=?
     WHERE userId = ?`,
    [name, email, position, mobile, altMobile, organizationId, about, socialLinks, userId],
    res
  );
  if (!result) return;
  res.status(200).end();
}
