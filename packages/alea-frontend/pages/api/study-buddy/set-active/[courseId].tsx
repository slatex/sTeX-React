import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfTypeOrSetError,
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from '../../comment-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!checkIfTypeOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;

  const courseId = req.query.courseId as string;
  const { active } = req.body;
  if (active === undefined) {
    res.status(400).json({ message: 'Missing [active]' });
    return;
  }
  const results = await executeAndEndSet500OnError(
    'UPDATE StudyBuddyUsers SET active=? WHERE userId=? AND courseId=?',
    [active, userId, courseId],
    res
  );

  if (!results) return;
  res.status(204).end();
}
