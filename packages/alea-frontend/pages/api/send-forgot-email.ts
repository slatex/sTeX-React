import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { executeAndEndSet500OnError } from './comment-utils';

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
    `UPDATE userinfo SET passwordResetToken = ? WHERE userId = ?`,
    [resetToken, email],
    res
  );
  const resetPasswordLink = `${req.headers.origin}/reset-password?email=${encodeURIComponent(email)}&id=${resetToken}`;

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'ALeA Password Reset',
    text: `Click on the given link to reset your password ${resetPasswordLink}.`,
  };
  res.status(200).json({
    message: 'Password reset link sent successfully to your email.',
  });
  await new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error occurred while sending email:', error);
        reject(error);
      } else {
        resolve(info);
      }
    });
  });
}
