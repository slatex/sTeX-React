import { NextApiRequest, NextApiResponse } from 'next';
import {
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';
import { EnrolledCourseIds } from '@stex-react/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;

  const result: EnrolledCourseIds[] = await executeAndEndSet500OnError(
    `SELECT courseId,active as activeStatus from StudyBuddyUsers WHERE userId=?;`,
    [userId],
    res
  );

  res.status(200).json(result);
}
