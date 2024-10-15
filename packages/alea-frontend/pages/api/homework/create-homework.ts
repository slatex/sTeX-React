import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfPostOrSetError, executeAndEndSet500OnError } from '../comment-utils';
import { getUserIdIfAuthorizedOrSetError } from '../access-control/resource-utils';
import { Action, ResourceName } from '@stex-react/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const {
    homeworkName,
    homeworkGivenDate,
    answerReleaseDate,
    courseId,
    courseInstance,
    archive,
    filepath,
  } = req.body;
  const userId = await getUserIdIfAuthorizedOrSetError(
    req,
    res,
    ResourceName.COURSE_HOMEWORK,
    Action.MUTATE,
    { courseId, instanceId: courseInstance }
  );
  if (!userId) return;
  const result = await executeAndEndSet500OnError(
    'INSERT INTO homework (homeworkName, homeworkGivenDate,answerReleaseDate, courseId, courseInstance, archive, filepath) VALUES (?, ?, ?,?, ?, ?, ?)',
    [
      homeworkName,
      homeworkGivenDate,
      answerReleaseDate,
      courseId,
      courseInstance,
      archive,
      filepath,
    ],
    res
  );
  if (!result) return;
  res.status(200).json({ result, message: 'Homework added successfully!' });
}
