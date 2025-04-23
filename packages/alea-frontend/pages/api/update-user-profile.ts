import { NextApiRequest, NextApiResponse } from 'next';
import { executeAndEndSet500OnError, getUserIdOrSetError } from './comment-utils';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = await getUserIdOrSetError(req, res);
  console.log(userId);
    if (!userId) return;

  const { firstName, lastName, email, studyProgram, semester, languages } = req.body;

  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const result = await executeAndEndSet500OnError(
    `UPDATE userInfo SET firstName = ?, lastName = ?, email = ?, studyProgram = ?, semester = ?, languages = ? WHERE userId = ?`,
    [firstName, lastName, email, studyProgram ?? null, semester ?? null, languages ?? null, userId],
    res
  );

  if (!result) return;
  res.status(200).json({ message: 'User profile updated successfully' });
}
