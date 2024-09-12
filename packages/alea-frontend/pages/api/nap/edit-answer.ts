import { UpdateAnswerRequest } from '@stex-react/api';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfPostOrSetError,
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  const { answer, id } = req.body as UpdateAnswerRequest;
  await executeAndEndSet500OnError(
    `Update Answer Set answer=? where id=? and userId=?`,
    [answer, id, userId],
    res
  );
  res.status(200).end();
}
