import {
  GetSortedCoursesByConnectionsResponse,
  isModerator,
} from '@stex-react/api';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';
import { getUserIdForStudyBuddyModerationOrSetError } from '../access-control/resource-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;

  // if (!isModerator(userId)) {
  //   res.status(403).send({ message: 'Unauthorized.' });
  //   return;
  // }

  if(! await getUserIdForStudyBuddyModerationOrSetError(req, res)){
    return res.status(403).send({ message: 'Unauthorized.' });
  }

  const result: GetSortedCoursesByConnectionsResponse[] =
    await executeAndEndSet500OnError(
      ` SELECT COUNT(courseId) as member, courseId
        FROM StudyBuddyUsers
        GROUP BY courseId
        ORDER BY member DESC`,
      [],
      res
    );
  res.status(200).json(result);
}
