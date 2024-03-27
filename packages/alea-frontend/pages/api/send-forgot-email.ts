import { NextApiRequest, NextApiResponse } from 'next';
import { executeAndEndSet500OnError } from './comment-utils';
import { sendEmail } from './email-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { email } = req.body;
  const existingUser = (await executeAndEndSet500OnError(
    `SELECT email FROM userInfo WHERE userId = ?`,
    [email],
    res
  )) as any[];

  if (existingUser.length === 0) {
    return res
      .status(400)
      .json({ message: 'This Email is not registered with us.' });
  }
  //adding password-reset-token to database
  const resetToken = crypto.randomUUID();
  await executeAndEndSet500OnError(
    `UPDATE userInfo SET passwordResetToken = ? ,   passwordResetRequestTimestampMs  = ? WHERE userId = ?`,
    [resetToken, Date.now(), email],
    res
  );
  const resetPasswordLink = `${
    req.headers.origin
  }/reset-password?email=${encodeURIComponent(email)}&id=${resetToken}`;

  await sendEmail(
    email,
    'ALeA Password Reset',
    `Click on the given link to reset your password ${resetPasswordLink}.`
  );
  res.status(200).json({
    message: 'Password reset link sent successfully to your email.',
  });
}
