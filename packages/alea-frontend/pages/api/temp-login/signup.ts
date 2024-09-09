import bcrypt from 'bcrypt';
import { NextApiRequest, NextApiResponse } from 'next';
import { executeAndEndSet500OnError } from '../comment-utils';
import { SALT_ROUNDS } from '../signup';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, firstName, lastName, password } = req.body.tempUserDetail;
  const existingUser = (await executeAndEndSet500OnError(
    `SELECT userId FROM userInfo WHERE userId = ?`,
    [userId],
    res
  )) as any[];

  if (existingUser.length === 1) {
    return res.status(400).json({ message: 'user already exists' });
  }

  const saltedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await executeAndEndSet500OnError(
    `INSERT INTO userInfo (userId,firstName,lastName, saltedPassword) VALUES (?, ? ,? ,?)`,
    [userId, firstName, lastName, saltedPassword],
    res
  );
  if (!result) return;
  res.status(200).json({ message: 'Avatar created successfully' });
}
