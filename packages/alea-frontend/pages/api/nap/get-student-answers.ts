import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfGetOrSetError,
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';
import { Answer } from '@stex-react/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  const answers = await executeAndEndSet500OnError<Answer[]>(
    `select * from Answer where userId=?`,
    [userId],
    res
  );
  res.send(answers);
}
