import { NextApiRequest, NextApiResponse } from 'next';
import { executeAndEndSet500OnError, getUserInfo } from './comment-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userInfo = await getUserInfo(req);
  if (!userInfo) {
    res.status(403).send({ message: "Couldn't get user info" });
    return;
  }
  const { userId, givenName, sn } = userInfo;
  const { showSectionReview } = req.body;
  const updateResult = await executeAndEndSet500OnError(
    `INSERT INTO userInfo (userId, firstName, lastName, showSectionReview)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE firstName=VALUES(firstName), lastName=VALUES(lastName), showSectionReview=VALUES(showSectionReview);`,
    [userId, givenName, sn, showSectionReview],
    res
  );

  if (!updateResult) return;

  res.status(204).end();
}
