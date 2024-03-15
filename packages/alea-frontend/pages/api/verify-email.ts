import { NextApiRequest, NextApiResponse } from 'next';
import { executeAndEndSet500OnError } from './comment-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { email, verificationToken } = req.body;
  const existingUser = (await executeAndEndSet500OnError(
    `SELECT email FROM userInfo WHERE userId = ? and verificationToken =?`,
    [email, verificationToken],
    res
  )) as any[];

  if (existingUser.length === 1) {
    await executeAndEndSet500OnError(
      `UPDATE userInfo SET isVerified=true WHERE userId=? and verificationToken=?`,
      [email, verificationToken],
      res
    );
    res.status(200).json({ message: 'Email Verified Successfully.' });
  } else {
    res.status(400).json({ message: 'Invalid userId or verification token' });
  }
}
