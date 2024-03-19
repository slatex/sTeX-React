import { NextApiRequest, NextApiResponse } from 'next';
import { executeAndEndSet500OnError } from './comment-utils';
import bcrypt from 'bcrypt';

async function getAccessToken(
  userId: string,
  firstName: string,
  lastName: string
) {
  // TODO
  return undefined;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { email, password } = req.body;
  const existingUsers = (await executeAndEndSet500OnError(
    `SELECT firstName, lastName, saltedPassword FROM userInfo WHERE userId = ?`,
    [email],
    res
  )) as any[];

  if (existingUsers?.length !== 1) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const hashedPasswordFromDB = existingUsers[0].saltedPassword;
  const passwordMatch = await bcrypt.compare(password, hashedPasswordFromDB);

  if (!passwordMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const access_token = await getAccessToken(
    email,
    existingUsers[0].firstName,
    existingUsers[0].lastName
  );

  res.status(200).json({ access_token });
}
