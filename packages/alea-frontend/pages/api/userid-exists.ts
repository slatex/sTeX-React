import { NextApiRequest, NextApiResponse } from 'next';
import { executeDontEndSet500OnError } from './comment-utils';

export async function doesUserIdExist(userId: string, res: NextApiResponse) {
  return (
    (
      await executeDontEndSet500OnError<any[]>(
        `SELECT userId FROM userInfo WHERE userId = ?`,
        [userId],
        res
      )
    ).length > 0
  );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.body;
  const exists = await doesUserIdExist(userId, res);
  return res.status(200).json({ exists });
}
