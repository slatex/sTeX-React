import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfGetOrSetError,
  executeDontEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res)) return;
  const userId = req.query.userId as string;
  if (!userId) return;
  const results: any = await executeDontEndSet500OnError(
    `SELECT name, resumeURL, email, mobile, programme, yearOfAdmission, yearOfGraduation, 
        courses, grades,gpa,location,gender, about,socialLinks
    FROM studentprofile 
    WHERE userId = ? 
    `,
    [userId],
    res
  );
  if (!results || !results.length) {
    return res.status(200).json([]);
  }
  res.status(200).json(results);
}
