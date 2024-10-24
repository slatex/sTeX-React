import { NextApiRequest, NextApiResponse } from 'next';
import { executeAndEndSet500OnError, getUserInfo } from './comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userInfo = await getUserInfo(req);
  if (!userInfo) {
    res.status(403).send({ message: "Couldn't get user info" });
    return;
  }
  const { userId, givenName, sn } = userInfo;

  const updateResult = await executeAndEndSet500OnError(
    `INSERT INTO userInfo (userId, firstName, lastName)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE firstName=VALUES(firstName), lastName=VALUES(lastName);`,
    [userId, givenName, sn],
    res
  );

  if (!updateResult) return;

  res.status(200).json({
    success: true,
    message: 'userInfo updated successfully',
  });
}
