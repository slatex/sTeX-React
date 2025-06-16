import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfPostOrSetError,
  executeAndEndSet500OnError,
  executeDontEndSet500OnError,
} from '../comment-utils';
import { RecruiterData } from '@stex-react/api';
async function getRecruiterProfileByUserId(userId: string, res: NextApiResponse) {
  const results: RecruiterData[] = await executeDontEndSet500OnError(
    `SELECT name,userId,email,position,mobile,altMobile,organizationId,socialLinks,about
     FROM recruiterprofile 
     WHERE userId = ? 
     `,
    [userId],
    res
  );
  return results;
}
//risky , donot use unless necessary.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const { id } = req.body;
  if (!id) return res.status(400).send('Recruiter id is missing');
  const recruiter = await getRecruiterProfileByUserId(id, res);
  if (!recruiter) return;
  const result = await executeAndEndSet500OnError(
    'DELETE FROM recruiterprofile WHERE userId = ?',
    [id],
    res
  );
  if (!result) return;
  res.status(200).end();
}
