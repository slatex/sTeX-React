import { NextApiRequest, NextApiResponse } from 'next';
import {
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';
import { EnrolledCourseIds } from '@stex-react/api';
import { CURRENT_TERM } from '@stex-react/utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;

  let instanceId = req.query.instanceId as string;
  if (!instanceId) instanceId = CURRENT_TERM;

  const result: EnrolledCourseIds[] = await executeAndEndSet500OnError(
    `SELECT courseId, active as activeStatus from StudyBuddyUsers 
    WHERE sbCourseId LIKE '%${instanceId}' AND userId=?`,
    [userId],
    res
  );

  res.status(200).json(result);
}
