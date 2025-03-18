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
  const organizationId = req.query.organizationId as string;

  console.log('ell', req.query);
  const results: any = await executeDontEndSet500OnError(
    `SELECT id,JobCategoryId,organizationId ,session,jobTitle,jobDescription,trainingLocation,qualification,targetYears,openPositions,currency,stipend,facilities,applicationDeadline
    FROM jobPost 
    WHERE organizationId = ?`,
    [organizationId],
    res
  );
  if (!results || !results.length) {
    return res.status(200).json([]);
  }

  res.status(200).json(results);
}
