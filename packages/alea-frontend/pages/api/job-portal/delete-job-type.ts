import { Action, ResourceName } from '@stex-react/utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserIdIfAuthorizedOrSetError } from '../access-control/resource-utils';
import { checkIfPostOrSetError, executeAndEndSet500OnError } from '../comment-utils';
import { getJobCategoryUsingIdOrSetError } from './update-job-type';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const { id } = req.body;
  if (!id) return res.status(400).send('jobCategories id is missing');

  const currentJobCategory = await getJobCategoryUsingIdOrSetError(id, res);
  if (!currentJobCategory) return;
  const {  instanceId } = currentJobCategory;

  const userId = await getUserIdIfAuthorizedOrSetError(
    req,
    res,
    ResourceName.JOB_PORTAL,
    Action.CREATE_JOB_TYPE,
    { instanceId: instanceId }
  );
  if (!userId) return;


  const result = await executeAndEndSet500OnError('DELETE FROM jobCategories WHERE id = ?', [id], res);
  if (!result) return;
  res.status(200).end();
}
