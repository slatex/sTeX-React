import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfPostOrSetError, executeAndEndSet500OnError, getUserIdOrSetError } from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  if(!userId)return;

  const { name,  email, organization, position } = req.body;

  const result = await executeAndEndSet500OnError(
    `INSERT INTO recruiterProfile 
      (name,userId,email,organization,position) 
     VALUES (?, ?, ?, ?, ?)`,
    [name, userId, email, organization, position],
    res
  );
  if (!result) return;
  res.status(201).end();
}
