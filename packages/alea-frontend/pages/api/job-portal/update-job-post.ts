import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfPostOrSetError,
  executeAndEndSet500OnError,
  executeDontEndSet500OnError,
} from '../comment-utils';
import { JobCategoryInfo } from '@stex-react/api';
import { getUserIdIfAuthorizedOrSetError } from '../access-control/resource-utils';
import { Action, CURRENT_TERM, ResourceName } from '@stex-react/utils';

export async function getJobPostUsingIdOrSetError(
  id: number,
  res: NextApiResponse
){
  const results = await executeDontEndSet500OnError(
    'SELECT * FROM jobpost WHERE id = ?',
    [id],
    res
  );
  if (!results) return;
  const currentJobPost = results[0];
  if (!currentJobPost) res.status(404).send('No jobpost yet');
  return currentJobPost;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const { id, jobTitle, trainingLocation, jobDescription, currency,stipend,facilities,qualification,targetYears,applicationDeadline,openPositions } = req.body ;
  if (!id) return res.status(400).send('Job Post Id is missing');

  const currentJobPost = await getJobPostUsingIdOrSetError(id, res);
  if (!currentJobPost) return res.status(404).send('Job Post not found');
  const {  updatedAt } = currentJobPost;

  const userId = await getUserIdIfAuthorizedOrSetError(
    req,
    res,
    ResourceName.JOB_PORTAL,
    Action.CREATE_JOB_POST,
    { instanceId: CURRENT_TERM }
  );
  if (!userId) return;

  const result = await executeAndEndSet500OnError(
    'UPDATE jobpost SET jobTitle = ?, trainingLocation = ?, jobDescription = ?, currency = ?, stipend=?,facilities=?,qualification=?,targetYears=?,applicationDeadline=?,openPositions=?,updatedAt=? WHERE id = ?',
    [jobTitle, trainingLocation, jobDescription, currency, stipend, facilities,qualification,targetYears,applicationDeadline,openPositions,updatedAt,id],
    res
  );
  if (!result) return;

  res.status(200).end();
}
