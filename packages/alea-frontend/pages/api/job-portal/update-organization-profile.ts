import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfPostOrSetError, executeAndEndSet500OnError } from '../comment-utils';
import { getUserIdIfAuthorizedOrSetError } from '../access-control/resource-utils';
import { Action, CURRENT_TERM, ResourceName } from '@stex-react/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const { data, id } = req.body;
  const userId = await getUserIdIfAuthorizedOrSetError(
    req,
    res,
    ResourceName.JOB_PORTAL_ORG,
    Action.CREATE_JOB_POST,
    { orgId: id, instanceId: CURRENT_TERM }
  );
  if (!userId) return;
  const {
    companyName,
    incorporationYear,
    isStartup,
    website,
    about,
    companyType,
    officeAddress,
    officePostalCode,
  } = data;
  const result = await executeAndEndSet500OnError(
    `UPDATE organizationProfile 
SET companyName = ?, 
    incorporationYear = ?, 
    isStartup = ?, 
    website = ?, 
    about = ?, 
    companyType = ?, 
    officeAddress = ?, 
    officePostalCode = ?
WHERE id = ?`,
    [
      companyName,
      incorporationYear,
      isStartup,
      website,
      about,
      companyType,
      officeAddress,
      officePostalCode,
      id,
    ],
    res
  );
  if (!result) return;
  res.status(200).end();
}
