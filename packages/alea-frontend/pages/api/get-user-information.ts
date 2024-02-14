import { NextApiRequest, NextApiResponse } from 'next';
import {
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from './comment-utils';
import { UserInformation } from '@stex-react/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;
  const result: UserInformation = await executeAndEndSet500OnError(
    `SELECT showTrafficLight,showCompetency,notificationSeenTs from userInfo where userId=?`,
    [userId],
    res
  );
  if (!result) return;
  if (!result[0]) {
    res.status(200).send({
      showTrafficLight: true,
      showCompetency: true,
      notificationSeenTs: null,
    });
  }
  res.status(200).send(result[0]);
}
