import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfGetOrSetError,
  executeDontEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;
  const jobPostId= req.query.jobPostId as string;
//   if (!instanceId) instanceId = CURRENT_TERM;
  const results: any = await executeDontEndSet500OnError(
    `SELECT id,jobPostId,applicantId,applicationStatus,applicantAction,recruiterAction,studentMessage,recruiterMessage
    FROM jobapplication 
    WHERE jobPostId = ?`,
    [jobPostId],
    res
  );
  if (!results) return;
  if (!results.length){ res.status(404).send('No job application yet');return null;}

  res.status(200).json(results);
}
