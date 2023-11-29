import { NextApiRequest, NextApiResponse } from 'next';
import {
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from '../../comment-utils';
import { Studybuddy } from '@stex-react/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = await getUserIdOrSetError(req, res);

  const courseId = req.query.courseId as string;

  const results: any[] = await executeAndEndSet500OnError(
    'SELECT * FROM StudyBuddyConnectUsers WHERE userId=? AND courseId=?',
    [userId, courseId],
    res
  );

  if (!results) return;
  if (results.length < 0) {
    res.status(404).end();
    return;
  }

  res.status(200).json(results[0] as Studybuddy);
}
