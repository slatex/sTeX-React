import { NextApiRequest, NextApiResponse } from 'next';
import {
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from '../../comment-utils';
import { UserStats, isModerator } from '@stex-react/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;

  if (!isModerator(userId)) {
    res.status(403).send({ message: 'Unauthorized.' });
    return;
  }
  const courseId = req.query.courseId as string;
  const result1: any[] = await executeAndEndSet500OnError(
    `SELECT 
      COUNT(userId) as TotalUsers, 
      SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) as ActiveUsers,
      SUM(CASE WHEN active = 0 THEN 1 ELSE 0 END) as InactiveUsers 
    FROM StudyBuddyUsers WHERE courseId = ?`,
    [courseId],
    res
  );
  const result2: any[] = await executeAndEndSet500OnError(
    `SELECT ROUND(COUNT(*) / 2) AS NumberOfConnections
    FROM StudyBuddyConnections as t1
    WHERE EXISTS (
      SELECT 1 FROM StudyBuddyConnections as t2 WHERE courseId = ? and t1.senderId = t2.receiverId
      AND t1.receiverId = t2.senderId
    )`,
    [courseId],
    res
  );
  const result3: any[] = await executeAndEndSet500OnError(
    `SELECT COUNT(*) as TotalRequests FROM StudyBuddyConnections WHERE courseId=?`,
    [courseId],
    res
  );

  const connections: any[] = await executeAndEndSet500OnError(
    `SELECT senderId , receiverId FROM StudyBuddyConnections WHERE courseId=?`,
    [courseId],
    res
  );

  const userIdsAndActiveStatus: any[] = await executeAndEndSet500OnError(
    `SELECT userId as id, active FROM StudyBuddyUsers WHERE courseId=?`,
    [courseId],
    res
  );

  if (!result1 || !result2 || !result3 || !connections || !userIdsAndActiveStatus)
    return;

  const userIdToAnonymousId = new Map<string, string>();
  userIdsAndActiveStatus
    .sort(() => 0.5 - Math.random())
    .forEach((item, index) => {
      userIdToAnonymousId.set(item.id, index.toString());
      item.id = index.toString();
    });

  const anonymousConnections = connections.map((item) => ({
    senderId: userIdToAnonymousId.get(item.senderId),
    receiverId: userIdToAnonymousId.get(item.receiverId),
  }));

  const combinedResults: UserStats = {
    totalUsers: result1[0].TotalUsers,
    activeUsers: result1[0].ActiveUsers,
    inactiveUsers: result1[0].InactiveUsers,
    numberOfConnections: result2[0].NumberOfConnections,
    unacceptedRequests:
      result3[0].TotalRequests - result2[0].NumberOfConnections * 2,
    connections: anonymousConnections,
    userIdsAndActiveStatus,
  };
  res.status(200).json(combinedResults);
}
