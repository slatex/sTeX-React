import { NextApiRequest, NextApiResponse } from 'next';
import { executeAndEndSet500OnError } from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.body;
  
  const existingAvatar = (await executeAndEndSet500OnError(
    `SELECT firstName FROM userInfo WHERE userId = ?`,
    [userId],
    res
  )) as any[];

  if (existingAvatar.length === 1) {
    return res.status(200).json({ exists: true, message: 'Avatar name already exists' });
  }
  return res.status(200).json({ exists: false, message: 'Avatar name is available' });
}
