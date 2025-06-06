import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfGetOrSetError, executeDontEndSet500OnError, getUserId } from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res)) return;
  const jobPostId = req.query.jobPostId;
  let userId = req.query.userId;
  if (!userId) userId = await getUserId(req);
  if (!userId) return;
  const results: any = await executeDontEndSet500OnError(
    `SELECT id,jobPostId,applicantId,applicationStatus,applicantAction,recruiterAction,studentMessage,recruiterMessage
    FROM jobapplication 
    WHERE jobPostId = ? AND applicantId=?`,
    [jobPostId, userId],
    res
  );
  if (!results || !results.length) {
    return res.status(200).json([]);
  }
  res.status(200).json(results);
}
