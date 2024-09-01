import { canAccessResource, isModerator } from '@stex-react/api';
import { NextApiRequest, NextApiResponse } from 'next';
import { getAllQuizzes } from '@stex-react/node-utils';
import { getUserIdOrSetError } from '../comment-utils';
import { Action, ResourceName } from '@stex-react/utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = await getUserIdOrSetError(req, res);
  if(!userId) return;
  const courseId = req.query.courseId as string;
  const instanceId = req.query.courseTerm as string;

  if (! await canAccessResource(ResourceName.COURSE_QUIZ, Action.MUTATE, {
    courseId,
    instanceId
  })){
    res.status(403).send({ message: 'Unauthorized.' });
  }

  res.status(200).json(getAllQuizzes());
}
