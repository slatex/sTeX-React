import { ResourceName, Action } from '@stex-react/utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserIdIfAnyAuthorizedOrSetError } from '../../access-control/resource-utils';
import {
  checkIfQueryParameterExistOrSetError,
  executeAndEndSet500OnError,
} from '../../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = await getUserIdIfAnyAuthorizedOrSetError(req, res, [
    { name: ResourceName.COURSE_PEERREVIEW, action: Action.MODERATE },
  ]);
  if (!userId) return;
  if (!checkIfQueryParameterExistOrSetError(req, res, 'id')) return;
  const id = +req.query.id;
  await executeAndEndSet500OnError(`Delete From Grading Where id=?`, [id], res);
  res.status(200).end();
}
