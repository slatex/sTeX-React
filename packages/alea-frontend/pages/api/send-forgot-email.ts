import { NextApiRequest, NextApiResponse } from 'next';
import { executeAndEndSet500OnError } from './comment-utils';
import nodemailer from 'nodemailer';

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

  //send email if user exist
  if (existingUser.length === 1) {
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
      text: 'We are working on it soon you will be able to reset your password.',
    };
    res.status(201).json({ message: 'Password Reset Link Sent succesfully.' });
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
}
