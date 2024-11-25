import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfPostOrSetError, executeAndEndSet500OnError } from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const {
    name,
    userId,
    email,
    contactNo,
    programme,
    yearOfAdmission,
    yearOfGraduation,
    courses,
    grades,
    about,
    resumeURL,
  } = req.body;
  const result = await executeAndEndSet500OnError(
    `INSERT INTO studentprofile 
      (name,userId, resumeURL, email, contactNo, programme, yearOfAdmission, yearOfGraduation, 
        courses, grades, about) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
    [
      name,
      userId,
      resumeURL,
      email,
      contactNo,
      programme,
      yearOfAdmission,
      yearOfGraduation,
      courses,
      grades,
      about,
    ],
    res
  );
  if (!result) return;
  res.status(200).json({ success: true, message: 'Student profile created successfully!' });
}
