import { PasswordReset } from '@stex-react/api';
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
    `SELECT passwordResetToken FROM userInfo WHERE userId = ?`,
    [email],
    res
  )) as PasswordReset[];

  if (userPasswordResetInfo.length === 0) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  if (!userPasswordResetInfo[0].passwordResetToken) {
    res.status(409).json({ message: 'Password reset token not set.' });
    return;
  }

  if (userPasswordResetInfo[0].passwordResetToken === resetPasswordToken) {
    //updating the password in database
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await executeAndEndSet500OnError(
      `UPDATE userinfo SET saltedPassword = ?,passwordResetToken=null WHERE userId = ?`,
      [hashedPassword, email],
      res
    );

    res.status(201).json({ message: 'Password updated successfully.' });
  } else {
    res.status(409).json({ message: 'Invalid token' });
  }
}
