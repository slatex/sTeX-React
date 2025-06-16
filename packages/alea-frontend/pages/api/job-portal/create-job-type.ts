import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfPostOrSetError, executeAndEndSet500OnError } from '../comment-utils';
import { getUserIdIfAuthorizedOrSetError } from '../access-control/resource-utils';
import { Action, CURRENT_TERM, ResourceName } from '@stex-react/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("hellooo")
  if (!checkIfPostOrSetError(req, res)) return;
  const userId = await getUserIdIfAuthorizedOrSetError(
    req,
    res,
    ResourceName.JOB_PORTAL,
    Action.CREATE_JOB_TYPE,
    { instanceId: CURRENT_TERM }
  );
  if (!userId) return;
  const { jobCategory, internshipPeriod, startDate,endDate } = req.body;
  console.log({jobCategory});
  let instanceId = req.body.instanceId as string;
  if (!instanceId) instanceId = CURRENT_TERM;

  const result = await executeAndEndSet500OnError(
    `INSERT INTO jobCategories 
      (jobCategory,internshipPeriod,startDate,endDate,instanceId) 
     VALUES (?, ?, ?, ?,?)`,
    [jobCategory, internshipPeriod, startDate, endDate,instanceId],
    res
  );
  if (!result) return;
  res.status(201).end();
}
