import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfPostOrSetError, executeAndEndSet500OnError } from '../comment-utils';
import { getUserIdIfAuthorizedOrSetError } from '../access-control/resource-utils';
import { Action, CURRENT_TERM, ResourceName } from '@stex-react/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const userId = await getUserIdIfAuthorizedOrSetError(
    req,
    res,
    ResourceName.JOB_PORTAL,
    Action.CREATE_JOB_POST,
    { instanceId: CURRENT_TERM }
  );
  if (!userId) return;
  const { data, id } = req.body;
  const {
    companyName,
    incorporationYear,
    isStartup,
    website,
    about,
    companyType,
    officeAddress,
    officePincode,
  } = data;
  const result = await executeAndEndSet500OnError(
    `UPDATE organizationprofile 
SET companyName = ?, 
    incorporationYear = ?, 
    isStartup = ?, 
    website = ?, 
    about = ?, 
    companyType = ?, 
    officeAddress = ?, 
    officePincode = ?
WHERE id = ?`,
    [
      companyName,
      incorporationYear,
      isStartup,
      website,
      about,
      companyType,
      officeAddress,
      officePincode,
      id,
    ],
    res
  );
  if (!result) return;
  res.status(200).end();
}
