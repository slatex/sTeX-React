import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfPostOrSetError, executeAndEndSet500OnError } from '../comment-utils';
import { getUserIdIfAuthorizedOrSetError } from '../access-control/resource-utils';
import { Action, CURRENT_TERM, ResourceName } from '@stex-react/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const { organizationId } = req.body;
  const userId = await getUserIdIfAuthorizedOrSetError(
    req,
    res,
    ResourceName.JOB_PORTAL_ORG,
    Action.CREATE_JOB_POST,
    { orgId: organizationId, instanceId: CURRENT_TERM }
  );
  if (!userId) return;
  const {
    JobCategoryId,
    session,
    jobTitle,
    jobDescription,
    trainingLocation,
    qualification,
    targetYears,
    openPositions,
    currency,
    stipend,
    facilities,
    applicationDeadline,
  } = req.body;

  const result = await executeAndEndSet500OnError(
    `INSERT INTO jobpost 
      (JobCategoryId,organizationId ,session,jobTitle,jobDescription,trainingLocation,qualification,targetYears,openPositions,currency,stipend,facilities,applicationDeadline) 
     VALUES (?,?,?, ?, ?, ?,?,?,?,?,?,?,?)`,
    [
      JobCategoryId,
      organizationId,
      session,
      jobTitle,
      jobDescription,
      trainingLocation,
      qualification,
      targetYears,
      openPositions,
      currency,
      stipend,
      facilities,
      applicationDeadline,
    ],
    res
  );
  if (!result) return;
  res.status(201).end();
}
