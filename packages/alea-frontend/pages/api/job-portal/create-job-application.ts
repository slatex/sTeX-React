import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfPostOrSetError,
  executeAndEndSet500OnError,
  executeDontEndSet500OnError,
} from '../comment-utils';
import { getUserIdIfAuthorizedOrSetError } from '../access-control/resource-utils';
import { Action, CURRENT_TERM, ResourceName } from '@stex-react/utils';

export async function checkJobApplicationExists(id: number, userId: string, res: NextApiResponse) {
  const results = await executeDontEndSet500OnError(
    'SELECT * FROM jobapplication WHERE jobPostId = ? AND applicantId = ?',
    [id, userId],
    res
  );

  if (!results) return;
  const currentJobApplication = results[0];
  if (!currentJobApplication) return false;
  // console.log({results});
  // if (results.length === 0) {
  //     console.log(
  //         'hello'
  //     );
  //     return false;
  // }
  return true;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const userId = await getUserIdIfAuthorizedOrSetError(
    req,
    res,
    ResourceName.JOB_PORTAL,
    Action.APPLY,
    { instanceId: CURRENT_TERM }
  );
  if (!userId) return;
  const { jobPostId, applicantId, applicationStatus } = req.body;
  const jobApplicationExists = await checkJobApplicationExists(jobPostId, userId, res);
  console.log({ jobApplicationExists });
  if (jobApplicationExists) return res.status(200).send('Already applied');

  const result = await executeAndEndSet500OnError(
    `INSERT INTO jobapplication 
      (jobPostId,applicantId,applicationStatus) 
     VALUES (?,?,?)`,
    [jobPostId, applicantId, applicationStatus],
    res
  );
  if (!result) return;
  res.status(201).end();
}
