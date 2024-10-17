import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfPostOrSetError, executeAndEndSet500OnError } from '../comment-utils';
import { getUserIdIfAuthorizedOrSetError } from '../access-control/resource-utils';
import { Action, CURRENT_TERM, ResourceName } from '@stex-react/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const { courseId, homeworkId } = req.body;
  const userId = await getUserIdIfAuthorizedOrSetError(
    req,
    res,
    ResourceName.COURSE_HOMEWORK,
    Action.MUTATE,
    { courseId, instanceId: CURRENT_TERM }
  );
  if (!userId) return;
  if (!homeworkId) {
    return res.status(400).json({ message: 'homeworkId is required' });
  }

  const result = await executeAndEndSet500OnError(
    'DELETE FROM homework WHERE homeworkId = ?',
    [homeworkId],
    res
  );
  if (!result) return;
  res.status(200).json({ message: 'Homework deleted successfully!' });
}
