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

  console.log("ell",req.query);
//   if (!instanceId) instanceId = CURRENT_TERM;
  const results: any = await executeDontEndSet500OnError(
    `SELECT id,JobCategoryId,organizationId ,session,jobTitle,jobDescription,trainingLocation,qualification,targetYears,openPositions,currency,stipend,facilities,applicationDeadline
    FROM jobPost 
    WHERE id = ?`,
    [jobPostId],
    res
  );
  if (!results) return;
  if (!results.length) return res.status(404).send('No job posted yet');

  res.status(200).json(results[0]);
}
