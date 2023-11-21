import { Notification } from '@stex-react/api';
import { NextApiRequest, NextApiResponse } from 'next';
import {
    checkIfPostOrSetError,
    executeAndEndSet500OnError
} from './comment-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!checkIfPostOrSetError(req, res)) return;
  const body: Notification = req.body;
  const results = await executeAndEndSet500OnError(
    `INSERT INTO notifications (userId, header, content) VALUES (?,?,?)`,
    [body.userId, body.header, body.content],
    res
  );
  if (!results) return;
  res.status(204).end();
}
