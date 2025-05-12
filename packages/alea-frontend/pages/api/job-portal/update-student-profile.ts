import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfPostOrSetError, executeAndEndSet500OnError } from '../comment-utils';
import { getUserIdIfAuthorizedOrSetError } from '../access-control/resource-utils';
import { Action, CURRENT_TERM, ResourceName } from '@stex-react/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const userId = await getUserIdIfAuthorizedOrSetError(
    req,
    res,
    ResourceName.JOB_PORTAL,
    Action.APPLY,
    { instanceId: CURRENT_TERM }
  );
  if (!userId) return;
  const {
    name,
    gender,
    email,
    mobile,
    altMobile,
    programme,
    courses,
    gpa,
    yearOfAdmission,
    yearOfGraduation,
    location,
    resumeURL,
    socialLinks,
    about,
  } = req.body;
  const result = await executeAndEndSet500OnError(
    `UPDATE studentprofile 
SET name = ?, 
    gender=?,
    email = ?, 
    mobile = ?, 
    altMobile=?,
    programme =? ,
    courses =?,
    gpa =?,
    yearOfAdmission = ?, 
    yearOfGraduation =?,
    location =? ,
resumeURL=?,
socialLinks=?,
    about = ?
WHERE userId = ?`,
    [
      name,
      gender,
      email,
      mobile,
      altMobile,
      programme,
      courses,
      gpa,
      yearOfAdmission,
      yearOfGraduation,
      location,
      resumeURL,
      socialLinks,
      about,
      userId,
    ],
    res
  );
  if (!result) return;
  res.status(200).end();
}
