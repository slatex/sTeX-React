import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfGetOrSetError,
  executeDontEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res)) return;

  const jobPostId= req.query.jobPostId ;
  const userId= req.query.userId ;
//   if (!instanceId) instanceId = CURRENT_TERM;
  const results: any = await executeDontEndSet500OnError(
    `SELECT id,jobPostId,applicantId,applicationStatus,applicantAction,recruiterAction,studentMessage,recruiterMessage
    FROM jobapplication 
    WHERE jobPostId = ? AND applicantId=?`,
    [jobPostId,userId],
    res
  );
  if (!results) return;
  if (!results.length){ res.status(404).send('No job application yet');
    return null;}

  res.status(200).json(results[0]);
}
