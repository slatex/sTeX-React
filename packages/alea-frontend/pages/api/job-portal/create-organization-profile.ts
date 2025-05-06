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
  const {
    companyName,
    incorporationYear,
    isStartup,
    website,
    about,
    companyType,
    officeAddress,
    officePincode,
  } = req.body;

  const result = await executeAndEndSet500OnError(
    `INSERT INTO organizationprofile 
      (companyName,incorporationYear, isStartup,website, about, companyType, officeAddress, officePincode) 
     VALUES (?, ?, ?, ?, ?, ?, ?,?)`,
    [
      companyName,
      incorporationYear,
      isStartup,
      website,
      about,
      companyType,
      officeAddress,
      officePincode,
    ],
    res
  );
  if (!result) return;
  res.status(201).end();
}
