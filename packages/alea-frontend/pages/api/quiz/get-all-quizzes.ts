import { getAllQuizzes } from '@stex-react/node-utils';
import { Action, ResourceName } from '@stex-react/utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserIdIfAuthorizedOrSetError } from '../access-control/resource-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const courseId = req.query.courseId as string;
  const instanceId = req.query.courseTerm as string;

  const userId = await getUserIdIfAuthorizedOrSetError(
    req,
    res,
    ResourceName.COURSE_QUIZ,
    Action.MUTATE,
    { courseId, instanceId }
  );
  if (!userId) return;

  const relevantQuizzes = getAllQuizzes().filter(
    (quiz) => quiz.courseId === courseId && quiz.courseTerm === instanceId
  );
  res.status(200).json(relevantQuizzes);
}
