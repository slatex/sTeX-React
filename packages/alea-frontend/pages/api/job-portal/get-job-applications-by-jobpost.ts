import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfGetOrSetError, executeDontEndSet500OnError } from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res)) return;
  const jobPostId = req.query.jobPostId as string;
  const results: any = await executeDontEndSet500OnError(
    `SELECT id,jobPostId,applicantId,applicationStatus,applicantAction,recruiterAction,studentMessage,recruiterMessage,createdAt
    FROM jobapplication 
    WHERE jobPostId = ?`,
    [jobPostId],
    res
  );
  if (!results || !results.length) {
    return res.status(200).json([]);
  }

  res.status(200).json(results);
}
