import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfGetOrSetError, executeDontEndSet500OnError } from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res)) return;
  const courseId = req.query.courseId as string;
  if (!courseId) return res.status(422).send({ messge: `Missing params.` });
  const results = await executeDontEndSet500OnError(
    'SELECT * FROM homework WHERE courseId = ? ORDER BY homeworkGivenDate ASC',
    [courseId],
    res
  );
  if (!results) return;
  res.status(200).json(results);
}
