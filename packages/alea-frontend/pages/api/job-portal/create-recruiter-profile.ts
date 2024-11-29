import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfPostOrSetError, executeAndEndSet500OnError } from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const { name, userId, email, organization, position } = req.body;

  const result = await executeAndEndSet500OnError(
    `INSERT INTO recruiterProfile 
      (name,userId,email,organization,position) 
     VALUES (?, ?, ?, ?, ?)`,
    [name, userId, email, organization, position],
    res
  );
  if (!result) return;
  res.status(200).json({  message: 'recruiter profile created successfully!' });
}
