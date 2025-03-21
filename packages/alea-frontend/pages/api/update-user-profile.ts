import { NextApiRequest, NextApiResponse } from 'next';
import { executeAndEndSet500OnError, getUserIdOrSetError } from './comment-utils';
import { Action, ResourceName } from '@stex-react/utils';



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get authorized user ID
  // const userId = await getUserIdIfAuthorizedOrSetError(req, res,ResourceName Action.MUTATE);

  const userId = await getUserIdOrSetError(req, res);
  console.log(userId);
    if (!userId) return;

  // Extract user profile data from request
  const { firstName, lastName, email, studyProgram, semester, languages } = req.body;

  // Ensure all fields exist
  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // **Update user profile in the database**
  const result = await executeAndEndSet500OnError(
    `UPDATE userinfo SET firstName = ?, lastName = ?, email = ?, studyProgram = ?, semester = ?, languages = ? WHERE userId = ?`,
    [firstName, lastName, email, studyProgram ?? null, semester ?? null, languages ?? null, userId],
    res
  );

  if (!result) return;
  res.status(200).json({ message: 'User profile updated successfully' });
}
