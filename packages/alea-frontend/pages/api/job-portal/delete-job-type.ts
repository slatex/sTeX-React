import { Action, ResourceName } from '@stex-react/utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserIdIfAuthorizedOrSetError } from '../access-control/resource-utils';
import { checkIfPostOrSetError, executeAndEndSet500OnError } from '../comment-utils';
import { getJobTypeUsingIdOrSetError } from './update-job-type';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const { id } = req.body;
  if (!id) return res.status(400).send('JobType id is missing');

  const currentJobtype = await getJobTypeUsingIdOrSetError(id, res);
  if (!currentJobtype) return;
  const {  instanceId } = currentJobtype;

  const userId = await getUserIdIfAuthorizedOrSetError(
    req,
    res,
    ResourceName.JOB_PORTAL,
    Action.CREATE_JOB_TYPE,
    { instanceId: instanceId }
  );
  if (!userId) return;


  const result = await executeAndEndSet500OnError('DELETE FROM jobtype WHERE id = ?', [id], res);
  if (!result) return;
  res.status(200).end();
}
