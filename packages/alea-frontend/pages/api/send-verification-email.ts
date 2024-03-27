import { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from './email-utils';
import { executeAndEndSet500OnError } from './comment-utils';

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
  const verificationLink = `${
    req.headers.origin
  }/verify?email=${encodeURIComponent(
    existingUser[0].email
  )}&id=${verificationToken}`;

  res.status(200).json({ message: 'verification email sent successfully' });

  // Send email with verification link.
  await sendEmail(
    existingUser[0].email,
    'Welcome to ALeA! Please Verify Your Email',
    `Thank you for registering with us. Please click on the following link to verify your email: ${verificationLink}`
  );
}
