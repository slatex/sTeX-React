import { NextApiRequest, NextApiResponse } from 'next';
import { executeAndEndSet500OnError } from '../comment-utils';
import { getUserIdIfAuthorizedOrSetError } from '../access-control/resource-utils';
import { Action, ResourceName } from '@stex-react/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).send("Method Not Allowed");
  }

  const quizId = req.query.quizId as string;
  const courseId = req.query.courseId as string;
  const courseInstance = req.query.courseInstance as string;
  const userID = await getUserIdIfAuthorizedOrSetError(
    req,
    res,
    ResourceName.COURSE_QUIZ,
    Action.MUTATE,
    { courseId, instanceId: courseInstance }    
  );
  if (!userID) return;

  const query = `SELECT userId, quizId, courseId, courseInstance FROM excused
       WHERE quizId = ? AND courseId = ? AND courseInstance = ?`;
  const result = await  executeAndEndSet500OnError(query, [quizId, courseId, courseInstance], res);
  return res.status(200).json(result);
}
