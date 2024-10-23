import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfGetOrSetError,
  checkIfQueryParameterExistOrSetError,
  executeAndEndSet500OnError,
} from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res) || !checkIfQueryParameterExistOrSetError(req, res, 'id'))
    return;
  const { id } = req.query;
  const answer = (await executeAndEndSet500OnError(
    'SELECT Answer.id,Answer.questionId,Answer.subProblemId,Answer.userId,Answer.answer,Answer.questionTitle,Answer.createdAt,Answer.updatedAt,Answer.courseId FROM ReviewRequest INNER JOIN Answer ON ReviewRequest.answerId = Answer.id where ReviewRequest.id=?',
    [id],
    res
  ))[0];
  res.send(answer);
}
