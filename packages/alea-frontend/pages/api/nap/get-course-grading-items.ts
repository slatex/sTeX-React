import { GetCourseGradingItemsResponse } from '@stex-react/api';
import { Action, CURRENT_TERM, ResourceName } from '@stex-react/utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserIdIfAuthorizedOrSetError } from '../access-control/resource-utils';
import { checkIfGetOrSetError } from '../comment-utils';
import { getAllHomeworksOrSetError } from '../homework/get-homework-list';
import { getGradingItems } from '../common-homework-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res)) return;
  const courseId = req.query.courseId as string;
  if (!courseId) return res.status(422).send('Missing params.');
  const instanceId = (req.query.courseInstance as string) ?? CURRENT_TERM;

  const userId = await getUserIdIfAuthorizedOrSetError(
    req,
    res,
    ResourceName.COURSE_HOMEWORK,
    Action.INSTRUCTOR_GRADING,
    { courseId, instanceId }
  );
  if (!userId) return;

  const homeworks = await getAllHomeworksOrSetError(courseId, instanceId, true, res);
  const gradingItems = await getGradingItems(courseId, instanceId, res);
  res.status(200).json({
    homeworks,
    gradingItems,
  } as GetCourseGradingItemsResponse);
}
