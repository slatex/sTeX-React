import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfPostOrSetError, executeAndEndSet500OnError } from '../comment-utils';
import { getUserIdIfAuthorizedOrSetError } from '../access-control/resource-utils';
import { Action, ResourceName } from '@stex-react/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const { quizId, userId, courseId, courseInstance } = req.body;
  if (!quizId) return res.status(422).send(`Missing Quiz id.`);
  const userID = await getUserIdIfAuthorizedOrSetError(
    req,
    res,
    ResourceName.COURSE_QUIZ,
    Action.MUTATE,
    { courseId, instanceId: courseInstance }    
  );
  if (!userID) return;
  const query = 'DELETE FROM excused WHERE userId = ? AND quizId = ?' ;
  const result = await executeAndEndSet500OnError(query, [userId, quizId], res);
  console.log('Excused quiz deletion result:', result);
  res.status(200).end();
}
