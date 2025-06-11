import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfGetOrSetError, executeDontEndSet500OnError } from '../comment-utils';
import { getUserIdIfAuthorizedOrSetError } from '../access-control/resource-utils';
import { Action, CURRENT_TERM, ResourceName } from '@stex-react/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res)) return;
  const organizationId = req.query.organizationId as string;
  const userId = await getUserIdIfAuthorizedOrSetError(
    req,
    res,
    ResourceName.JOB_PORTAL_ORG,
    Action.CREATE_JOB_POST,
    { orgId: organizationId, instanceId: CURRENT_TERM }
  );
  if (!userId) return;
  const results: any = await executeDontEndSet500OnError(
    `SELECT id,jobCategoryId,organizationId ,createdByUserId,session,jobTitle,jobDescription,trainingLocation,qualification,targetYears,openPositions,currency,stipend,facilities,applicationDeadline,createdAt
    FROM jobPost 
    WHERE organizationId = ?`,
    [organizationId],
    res
  );
  if (!results || !results.length) {
    return res.status(200).json([]);
  }

  res.status(200).json(results);
}
