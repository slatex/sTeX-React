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
  const {organizationId, jobTypeId,session,jobTitle,jobDescription,trainingLocation,qualification, targetYears, openPositions,currency,stipend,facilities,applicationDeadline
  } = req.body;
  console.log({organizationId})
console.log("of",req.body);
//   let instanceId = req.body.instanceId as string;
//   if (!instanceId) instanceId = CURRENT_TERM;

  const result = await executeAndEndSet500OnError(
    `INSERT INTO jobpost 
      (jobTypeId,organizationId ,session,jobTitle,JobDescription,trainingLocation,qualification,targetYears,openPositions,currency,stipend,facilities,applicationDeadline) 
     VALUES (?,?,?, ?, ?, ?,?,?,?,?,?,?,?)`,
    [jobTypeId ,organizationId,session,jobTitle,jobDescription,trainingLocation,qualification,targetYears,openPositions,currency,stipend,facilities,applicationDeadline
    ],
    res
  );
  if (!result) return;
  res.status(201).end();
}
