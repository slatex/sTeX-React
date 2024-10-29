import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfQueryParameterExistOrSetError,
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';
import { AnswerResponse } from '@stex-react/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfQueryParameterExistOrSetError(req, res, ['questionId', 'subProblemId'])) return;
  const { questionId, subProblemId } = req.query;
  const userId = await getUserIdOrSetError(req, res);
  const answer = (
    await executeAndEndSet500OnError<AnswerResponse[]>(
      `select id,answer,createdAt,updatedAt from Answer where questionId=? and subProblemId=? and userId=? and homeworkId is not null`,
      [questionId, subProblemId, userId],
      res
    )
  )[0];
  res.send(answer);
}
