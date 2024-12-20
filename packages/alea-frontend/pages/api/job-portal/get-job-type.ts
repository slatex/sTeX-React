import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfGetOrSetError,
  executeDontEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';
import { CURRENT_TERM } from '@stex-react/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;
  let instanceId = req.query.instanceId as string;
  if (!instanceId) instanceId = CURRENT_TERM;
  const results: any = await executeDontEndSet500OnError(
    `SELECT id,jobTypeName,internshipPeriod,startDate,endDate
    FROM jobtype 
    WHERE instanceId = ?`,
    [instanceId],
    res
  );
  if (!results) return;
  if (!results.length) return res.status(404).send('No job created yet');

  res.status(200).json(results);
}
