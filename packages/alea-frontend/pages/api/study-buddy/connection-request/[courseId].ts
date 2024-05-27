import { NotificationType } from '@stex-react/api';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfTypeOrSetError,
  executeAndEndSet500OnError,
  getUserInfo,
  sendNotification,
} from '../../comment-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!checkIfTypeOrSetError(req, res)) return;
  const user = await getUserInfo(req);
  const userId = user?.userId;
  if (!userId) {
    res.status(403).send({ message: 'User info not available' });
    return;
  }
  const courseId = req.query.courseId as string;
  const receiverId = req.body?.receiverId;

  if (!receiverId) {
    res.status(400).json({ message: `receiverId not found` });
    return;
  }

  const results = await executeAndEndSet500OnError(
    'INSERT INTO StudyBuddyConnections(senderId, receiverId, courseId) VALUES (?, ?, ?)',
    [userId, receiverId, courseId],
    res
  );

  if (!results) return;
  res.status(204).end();
  sendNotification(
    receiverId,
    `${user.fullName} would like to study together for the ${courseId} course.`,
    '',
    `${user.fullName} würde gerne gemeinsam für den ${courseId}-Kurs lernen.`,
    '',
    NotificationType.STUDY_BUDDY,
    `/study-buddy/${courseId}`
  );
}
