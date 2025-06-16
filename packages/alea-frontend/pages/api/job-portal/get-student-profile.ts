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
  const results: any = await executeDontEndSet500OnError(
    `SELECT userId,name, resumeUrl, email, mobile, programme, yearOfAdmission, yearOfGraduation, 
        courses, grades,gpa,location, about,socialLinks
    FROM studentprofile 
    WHERE userId = ? 
    `,
    [userId],
    res
  );
  if (!results || !results.length) {
    return res.status(200).json([]);
  }
  const student = results[0];
  let parsedSocialLinks: Record<string, string> = {};

  if (typeof student.socialLinks === 'string') {
    parsedSocialLinks = JSON.parse(student.socialLinks);
  } else {
    parsedSocialLinks = student.socialLinks || {};
  }
  res.status(200).json({
    ...student,
    socialLinks: parsedSocialLinks,
  });
}
