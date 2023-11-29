import { NextApiRequest, NextApiResponse } from 'next';
import {
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from '../../comment-utils';
import { GetAllStudyBuddiesResponse, Studybuddy } from '@stex-react/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = await getUserIdOrSetError(req, res);

  const courseId = req.query.courseId as string;

  const receivedRequests: any[] = await executeAndEndSet500OnError(
    'SELECT senderId FROM StudyBuddyConnections WHERE receiverId=? AND courseId=?',
    [userId, courseId],
    res
  );

  if (!receivedRequests) return;

  const sentRequests: any[] = await executeAndEndSet500OnError(
    'SELECT receiverId FROM StudyBuddyConnections WHERE senderId=? AND courseId=?',
    [userId, courseId],
    res
  );

  if (!sentRequests) return;

  const allStudybuddies: any[] = await executeAndEndSet500OnError(
    'SELECT * FROM StudyBuddyConnectUsers WHERE NOT userId=? AND courseId=? AND active=?',
    [userId, courseId, true],
    res
  );

  if (!allStudybuddies) return;

  const userStatusses = new Map<string, string>();
  for (const row of receivedRequests) {
    userStatusses.set(row.senderId, 'received');
  }

  for (const row of sentRequests) {
    if (userStatusses.has(row.receiverId)) {
      userStatusses.set(row.receiverId, 'connected');
    } else {
      userStatusses.set(row.receiverId, 'sent');
    }
  }

  const connected: Studybuddy[] = [];
  const requestSent: Studybuddy[] = [];
  const requestReceived: Studybuddy[] = [];
  const other: Studybuddy[] = [];

  for (const row of allStudybuddies) {
    const status = userStatusses.get(row.userId);
    if (status == 'connected') {
      connected.push(row);
    } else if (status == 'sent') {
      delete row.email;
      requestSent.push(row);
    } else if (status == 'received') {
      delete row.email;
      requestReceived.push(row);
    } else {
      delete row.email;
      other.push(row);
    }
  }

  res.status(200).json({
    connected,
    requestSent,
    requestReceived,
    other,
  } as GetAllStudyBuddiesResponse);
}
