import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfGetOrSetError,
  getUserIdOrSetError,
  executeAndEndSet500OnError,
} from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;
  const result = await executeAndEndSet500OnError(
    `select id,questionId,subProblemId,answer,questionTitle,courseId,courseInstance, updatedAt from Answer where userId=? and homeworkId is null order by updatedAt desc`,
    [userId],
    res
  );
  return res.json(result);
}
