import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfPostOrSetError, executeAndEndSet500OnError } from '../comment-utils';
import { getUserIdIfAuthorizedOrSetError } from '../access-control/resource-utils';
import { Action, ResourceName } from '@stex-react/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const {
    homeworkId,
    homeworkName,
    homeworkGivenDate,
    answerReleaseDate,
    courseId,
    courseInstance,
    archive,
    filepath,
  } = req.body;
  if (!homeworkId) {
    return res.status(400).json({ message: 'homeworkId is required' });
  }
  const userId = await getUserIdIfAuthorizedOrSetError(
    req,
    res,
    ResourceName.COURSE_HOMEWORK,
    Action.MUTATE,
    { courseId, instanceId: courseInstance }
  );
  if (!userId) return;
  const result = await executeAndEndSet500OnError(
    'UPDATE homework SET homeworkName = ?, homeworkGivenDate = ?,answerReleaseDate=?, courseId = ?, courseInstance = ?, archive = ?, filepath = ? WHERE homeworkId = ?',
    [
      homeworkName,
      homeworkGivenDate,
      answerReleaseDate,
      courseId,
      courseInstance,
      archive,
      filepath,
      homeworkId,
    ],
    res
  );
  if (!result) return;
  res.status(200).json({ result, message: 'Homework updated successfully!' });
}
