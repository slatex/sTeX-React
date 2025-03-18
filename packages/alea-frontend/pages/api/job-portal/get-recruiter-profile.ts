import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfGetOrSetError,
  executeDontEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';
import { RecruiterData } from '@stex-react/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;
  const results: RecruiterData[] = await executeDontEndSet500OnError(
    `SELECT name,userId,email,position,hasDefinedOrg,mobile,altMobile,organizationId,socialLinks,about
    FROM recruiterprofile 
    WHERE userId = ? 
    `,
    [userId],
    res
  );
  if (!results || !results.length) {
    return res.status(200).json([]);
  }
  res.status(200).json(results[0]);
}
