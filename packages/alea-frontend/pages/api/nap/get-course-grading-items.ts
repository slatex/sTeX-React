import { GetCourseGradingItemsResponse } from '@stex-react/api';
import { Action, CURRENT_TERM, ResourceName } from '@stex-react/utils';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  isUserIdAuthorizedForAny,
} from '../access-control/resource-utils';
import { checkIfGetOrSetError, getUserIdOrSetError } from '../comment-utils';
import { getAllHomeworksOrSetError } from '../homework/get-homework-list';
import { getGradingItems } from '../common-homework-utils';
enum UserType {
  Instructor,
  Student,
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res)) return;
  const courseId = req.query.courseId as string;
  if (!courseId) return res.status(422).send('Missing params.');
  const instanceId = (req.query.courseInstance as string) ?? CURRENT_TERM;
  let userType: UserType = UserType.Instructor;
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;
  const isInstructor = await isUserIdAuthorizedForAny(userId, [
    {
      name: ResourceName.COURSE_HOMEWORK,
      action: Action.INSTRUCTOR_GRADING,
      variables: { courseId: courseId, instanceId: instanceId },
    },
  ]);
  if (!isInstructor) {
    userType = UserType.Student;
    const isStudent = await isUserIdAuthorizedForAny(userId, [
      {
        name: ResourceName.COURSE_HOMEWORK,
        action: Action.TAKE,
        variables: {
          courseId,
          instanceId,
        },
      },
    ]);
    if (!isStudent) return;
  }
  const homeworks = await getAllHomeworksOrSetError(courseId, instanceId, true, res);
  const gradingItems = await getGradingItems(
    courseId,
    instanceId,
    userType === UserType.Student,
    res
  );
  res.status(200).json({
    homeworks,
    gradingItems,
  } as GetCourseGradingItemsResponse);
}
