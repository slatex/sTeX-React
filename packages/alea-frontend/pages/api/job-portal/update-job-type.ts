import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfPostOrSetError,
  executeAndEndSet500OnError,
  executeDontEndSet500OnError,
} from '../comment-utils';
import { JobTypeInfo } from '@stex-react/api';
import { getUserIdIfAuthorizedOrSetError } from '../access-control/resource-utils';
import { Action, ResourceName } from '@stex-react/utils';

export type DbJobTypeInfo = JobTypeInfo & {
  updatedAt: Date;
  createdAt: Date;
  instanceId: string;
};

export async function getJobTypeUsingIdOrSetError(
  id: number,
  res: NextApiResponse
): Promise<DbJobTypeInfo | undefined> {
  const results = await executeDontEndSet500OnError(
    'SELECT * FROM jobtype WHERE id = ?',
    [id],
    res
  );
  if (!results) return;
  const currentJobtype = results[0];
  if (!currentJobtype) res.status(404).send('JobType not found');
  return currentJobtype;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const { id, jobTypeName, startDate, endDate, internshipPeriod } = req.body as JobTypeInfo;
  if (!id) return res.status(400).send('JobType id is missing');

  const currentJobtype = await getJobTypeUsingIdOrSetError(id, res);
  if (!currentJobtype) return res.status(404).send('JobType not found');
  const { instanceId, updatedAt } = currentJobtype;

  const userId = await getUserIdIfAuthorizedOrSetError(
    req,
    res,
    ResourceName.JOB_PORTAL,
    Action.CREATE_JOB_TYPE,
    { instanceId: instanceId }
  );
  if (!userId) return;

  const result = await executeAndEndSet500OnError(
    'UPDATE jobtype SET jobTypeName = ?, internshipPeriod = ?, startDate = ?, endDate = ?, updatedAt=? WHERE id = ?',
    [jobTypeName, internshipPeriod, startDate, endDate, updatedAt, id],
    res
  );
  if (!result) return;

  res.status(200).end();
}
