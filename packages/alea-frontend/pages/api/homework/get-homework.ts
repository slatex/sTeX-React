import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfGetOrSetError, executeDontEndSet500OnError } from '../comment-utils';
import { getUserIdIfAuthorizedOrSetError } from '../access-control/resource-utils';
import { Action, ResourceName } from '@stex-react/utils';
import { CURRENT_TERM } from '@stex-react/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res)) return;
  const courseId = req.query.courseId as string;
  if (!courseId) return res.status(422).send({ messge: `Missing params.` });
  const userId = await getUserIdIfAuthorizedOrSetError(
    req,
    res,
    ResourceName.COURSE_HOMEWORK,
    Action.MUTATE,
    { courseId, instanceId: CURRENT_TERM }
  );
  if (!userId) return;
  const results = await executeDontEndSet500OnError(
    'SELECT * FROM homework WHERE courseId = ? ORDER BY homeworkGivenDate ASC',
    [courseId],
    res
  );
  if (!results) return;
  res.status(200).json(results);
}
