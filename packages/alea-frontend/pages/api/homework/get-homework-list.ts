import { CURRENT_TERM } from '@stex-react/utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfGetOrSetError, executeDontEndSet500OnError } from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res)) return;
  const courseId = req.query.courseId as string;
  if (!courseId) return res.status(422).send('Missing params.');
  const results: any[] = await executeDontEndSet500OnError(
    `SELECT id, title, givenTs, dueTs, feedbackReleaseTs, courseId, courseInstance
    FROM homework 
    WHERE courseId = ? AND courseInstance = ?
    ORDER BY dueTs ASC`,
    [courseId, CURRENT_TERM],
    res
  );
  if (!results) return;
  
  res.status(200).json(results);
}
