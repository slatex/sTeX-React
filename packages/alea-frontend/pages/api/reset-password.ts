import bcrypt from 'bcrypt';
import { NextApiRequest, NextApiResponse } from 'next';
import { executeAndEndSet500OnError } from './comment-utils';
import { SALT_ROUNDS } from './signup';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { email, resetPasswordToken, newPassword } = req.body;
  const userPasswordResetInfo = (await executeAndEndSet500OnError(
    `SELECT passwordResetToken , passwordResetRequestTimestampMs FROM userInfo WHERE userId = ?`,
    [email],
    res
  )) as any[];

  if (userPasswordResetInfo.length === 0) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  if (!userPasswordResetInfo[0].passwordResetToken) {
    res.status(409).json({ message: 'Password reset token not set.' });
    return;
  }
  if (userPasswordResetInfo[0].passwordResetToken !== resetPasswordToken) {
    return res.status(400).json({ message: 'Invalid token' });
  }

  const tokenGeneratedAt =
    userPasswordResetInfo[0].passwordResetRequestTimestampMs;
  const currentTime = Date.now();
  // Check if the link has expired
  if (!tokenGeneratedAt) {
    return res.status(400).json({ message: 'Invalid token' });
  }
  if (currentTime - tokenGeneratedAt > 2 * 60 * 60 * 1000) {
    return res.status(410).json({ message: 'Reset link has expired.' });
  }

  //updating the password in database
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await executeAndEndSet500OnError(
    `UPDATE userInfo SET saltedPassword = ?,passwordResetToken=null WHERE userId = ?`,
    [hashedPassword, email],
    res
  );
  return res.status(200).json({ message: 'Password updated successfully.' });
}
