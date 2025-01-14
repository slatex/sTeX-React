import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfPostOrSetError,
  executeAndEndSet500OnError,
  executeDontEndSet500OnError,
} from '../comment-utils';
import { JobCategoryInfo } from '@stex-react/api';
import { getUserIdIfAuthorizedOrSetError } from '../access-control/resource-utils';
import { Action, CURRENT_TERM, ResourceName } from '@stex-react/utils';

export async function getJobApplicationUsingIdOrSetError(
  id: number,
  res: NextApiResponse
){
  const results = await executeDontEndSet500OnError(
    'SELECT * FROM jobApplication WHERE id = ?',
    [id],
    res
  );
  if (!results) return;
  const currentJobApplication = results[0];
  if (!currentJobApplication) res.status(404).send('No jobpost yet');
  return currentJobApplication;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const { id, applicationStatus, applicantAction, recruiterAction, studentMessage,recruiterMessage } = req.body ;
  console.log({applicantAction});
  console.log({recruiterAction});

  if (!id) return res.status(400).send('Job Application Id is missing');

  const currentJobApplication = await getJobApplicationUsingIdOrSetError(id, res);
  if (!currentJobApplication) return res.status(404).send('Job Application not found');
  const {  updatedAt } = currentJobApplication;

//   const recruiter = await getUserIdIfAuthorizedOrSetError(
//     req,
//     res,
//     ResourceName.JOB_PORTAL,
//     Action.CREATE_JOB_POST,
//     { instanceId: CURRENT_TERM }
//   );
//   console.log({recruiter});
//   const student = await getUserIdIfAuthorizedOrSetError(
//     req,
//     res,
//     ResourceName.JOB_PORTAL,
//     Action.APPLY,
//     { instanceId: CURRENT_TERM }
//   );
//   console.log({student})
//   const userId=student||recruiter;
//   if (!userId) return;

  const result = await executeAndEndSet500OnError(
    'UPDATE jobApplication SET applicationStatus = ?, applicantAction = ?, recruiterAction = ?, studentMessage = ?, recruiterMessage=?,updatedAt=? WHERE id = ?',
    [applicationStatus, applicantAction, recruiterAction, studentMessage, recruiterMessage, updatedAt,id],
    res
  );
  if (!result) return;

  res.status(200).end();
}
