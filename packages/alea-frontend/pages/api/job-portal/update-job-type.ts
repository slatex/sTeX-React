import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfPostOrSetError,
  executeAndEndSet500OnError,
  executeDontEndSet500OnError,
} from '../comment-utils';
import { JobCategoryInfo } from '@stex-react/api';
import { getUserIdIfAuthorizedOrSetError } from '../access-control/resource-utils';
import { Action, ResourceName } from '@stex-react/utils';

export type DbJobCategoryInfo = JobCategoryInfo & {
  updatedAt: Date;
  createdAt: Date;
  instanceId: string;
};

export async function getJobCategoryUsingIdOrSetError(
  id: number,
  res: NextApiResponse
): Promise<DbJobCategoryInfo | undefined> {
  const results = await executeDontEndSet500OnError(
    'SELECT * FROM jobCategories WHERE id = ?',
    [id],
    res
  );
  if (!results) return;
  const currentJobCategory = results[0];
  if (!currentJobCategory) res.status(404).send('jobCategories not found');
  return currentJobCategory;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const { id, jobCategory, startDate, endDate, internshipPeriod } = req.body as JobCategoryInfo;
  if (!id) return res.status(400).send('jobCategories id is missing');

  const currentJobCategory = await getJobCategoryUsingIdOrSetError(id, res);
  if (!currentJobCategory) return res.status(404).send('jobCategories not found');
  const { instanceId, updatedAt } = currentJobCategory;

  const userId = await getUserIdIfAuthorizedOrSetError(
    req,
    res,
    ResourceName.JOB_PORTAL,
    Action.CREATE_JOB_TYPE,
    { instanceId: instanceId }
  );
  if (!userId) return;

  const result = await executeAndEndSet500OnError(
    'UPDATE jobCategories SET jobCategory = ?, internshipPeriod = ?, startDate = ?, endDate = ?, updatedAt=? WHERE id = ?',
    [jobCategory, internshipPeriod, startDate, endDate, updatedAt, id],
    res
  );
  if (!result) return;

  res.status(200).end();
}
