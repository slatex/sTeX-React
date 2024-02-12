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
  const { userId } = userInfo;
  const { trafficStatus } = req.body;

  const updateResult = await executeAndEndSet500OnError(
    `UPDATE userInfo
    SET showTrafficLight = ?
    WHERE userId = ?;`,
    [trafficStatus, userId],
    res
  );

  if (!updateResult) return;

  res.status(200).json({
    success: true,
    message: 'trafficLight status updated successfully',
  });
}
