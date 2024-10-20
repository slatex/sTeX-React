import { GetSortedCoursesByConnectionsResponse } from '@stex-react/api';
import { CURRENT_TERM } from '@stex-react/utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserIdIfCanModerateStudyBuddyOrSetError } from '../access-control/resource-utils';
import { executeAndEndSet500OnError } from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = await getUserIdIfCanModerateStudyBuddyOrSetError(req, res);
  if (!userId) return;

  let instanceId = req.query.instanceId as string;
  if (!instanceId) instanceId = CURRENT_TERM;

  const result: GetSortedCoursesByConnectionsResponse[] = await executeAndEndSet500OnError(
    `SELECT COUNT(courseId) as member, courseId
        FROM StudyBuddyUsers
        WHERE sbCourseId LIKE '%${instanceId}'
        GROUP BY courseId
        ORDER BY member DESC`,
    [],
    res
  );
  res.status(200).json(result);
}
