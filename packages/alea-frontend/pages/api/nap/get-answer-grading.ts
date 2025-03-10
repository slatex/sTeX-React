import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfGetOrSetError,
  getUserIdOrSetError,
  executeAndEndSet500OnError,
  checkIfQueryParameterExistOrSetError,
} from '../comment-utils';
import { getAllGradingsOrSetError } from './get-answers-with-grading';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;
  if (!checkIfQueryParameterExistOrSetError(req, res, 'answerId')) return;
  const answerId = +req.query.answerId;
  if (!checkIfQueryParameterExistOrSetError(req, res, 'subProblemId')) return;
  const subProblemId = req.query.subProblemId as string;

  if (
    (
      await executeAndEndSet500OnError<[]>(
        'select id from Answer where userId=? and id=? and subProblemId=? and homeworkId is null',
        [userId, answerId, subProblemId],
        res
      )
    ).length === 0
  ) {
    return res.status(404).end();
  }
  const result = (await getAllGradingsOrSetError({ [subProblemId]: answerId }, res))[subProblemId];
  return res.json(result);
}
