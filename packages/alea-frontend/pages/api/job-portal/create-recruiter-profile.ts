import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfPostOrSetError, executeAndEndSet500OnError } from '../comment-utils';
import { getUserIdIfAuthorizedOrSetError } from '../access-control/resource-utils';
import { Action, CURRENT_TERM, ResourceName } from '@stex-react/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const userId = await getUserIdIfAuthorizedOrSetError(
    req,
    res,
    ResourceName.JOB_PORTAL,
    Action.CREATE_JOB_POST,
    { instanceId: CURRENT_TERM }
  );
  if (!userId) return;
  const { name, email, position } = req.body;

  const result = await executeAndEndSet500OnError(
    `INSERT INTO recruiterProfile 
      (name,userId,email,position) 
     VALUES (?, ?, ?, ?)`,
    [name, userId, email, position],
    res
  );
  if (!result) return;
  res.status(201).end();
}
