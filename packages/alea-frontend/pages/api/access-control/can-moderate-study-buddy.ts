import { NextApiRequest, NextApiResponse } from 'next';
import { getUserIdOrSetError } from '../comment-utils';
import { canUserModerateStudyBuddy } from './resource-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;
  const courseId = req.query.courseId as string;
  const courseTerm = req.query.courseTerm as string;
  res
    .status(200)
    .send(await canUserModerateStudyBuddy(userId, courseId, courseTerm));
}
