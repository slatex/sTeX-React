import { NextApiRequest, NextApiResponse } from 'next';
import { executeAndEndSet500OnError } from './comment-utils';
import { sendVerificationEmail } from './signup';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId, verificationToken } = req.body;
  const existingUser = (await executeAndEndSet500OnError(
    `SELECT email FROM userInfo WHERE userId = ?`,
    [userId],
    res
  )) as any[];

  if (existingUser.length === 0) {
    return res
      .status(400)
      .json({ message: 'This Email is not registered with us.' });
  }
  await executeAndEndSet500OnError(
    `UPDATE userInfo SET verificationToken=? WHERE userId = ?`,
    [verificationToken, existingUser[0].email],
    res
  );
  // Verification link creation.

  res.status(200).json({ message: 'Verification email sent successfully' });

  // Send email with verification link.
  sendVerificationEmail(
    existingUser[0].email,
    verificationToken,
    req.headers.origin
  );
}
