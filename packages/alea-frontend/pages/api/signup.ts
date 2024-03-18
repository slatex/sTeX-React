import { NextApiRequest, NextApiResponse } from 'next';
import { executeAndEndSet500OnError } from './comment-utils';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import { sendEmail } from './email-utils';

export const SALT_ROUNDS = 10;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { email, firstName, lastName, password, verificationToken } =
    req.body.userDetail;

  //verification link creation
  const verificationLink = `${
    req.headers.origin
  }/verify?email=${encodeURIComponent(email)}&id=${verificationToken}`;

  // password hashing
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const existingUser = (await executeAndEndSet500OnError(
    `SELECT userId FROM userInfo WHERE userId = ?`,
    [email],
    res
  )) as any[];

  if (existingUser.length === 1) {
    return res.status(400).json({ message: 'Email already exists' });
  }
  const result = await executeAndEndSet500OnError(
    `INSERT INTO userInfo (userId, firstName, lastName, email , saltedPassword, verificationToken, isVerified) VALUES (?, ?,?, ?, ?, ?, ?)`,
    [
      email,
      firstName,
      lastName,
      email,
      hashedPassword,
      verificationToken,
      false,
    ],
    res
  );

  if (!result) return;

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  res.status(201).json({ message: 'User created successfully' });

  // Send email with verification link.
  await sendEmail(
    email,
    `Thank you for registering with us. Please click on the following link to verify your email: ${verificationLink}`
  );
}
