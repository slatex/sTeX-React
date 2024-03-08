import { NextApiRequest, NextApiResponse } from 'next';
import { executeAndEndSet500OnError } from './comment-utils';
import bcrypt from 'bcrypt';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { email, password } = req.body;
  const existingUser = (await executeAndEndSet500OnError(
    `SELECT saltedPassword FROM userInfo WHERE userId = ?`,
    [email],
    res
  )) as any[];

  if (existingUser.length === 0) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const hashedPasswordFromDB = existingUser[0].saltedPassword;
  const passwordMatch = await bcrypt.compare(password, hashedPasswordFromDB);

  if (!passwordMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.status(200).json({ message: 'Login successful', user: existingUser[0] });
}
