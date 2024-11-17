import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfGetOrSetError,
  checkIfQueryParameterExistOrSetError,
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res) || !checkIfQueryParameterExistOrSetError(req, res, 'id'))
    return;
  const { id } = req.query;
  const userId = await getUserIdOrSetError(req, res);
  const answer = (
    await executeAndEndSet500OnError(
      `select id,answer,questionId,subProblemId,homeworkId from Answer where id=? and homeworkId is not null and userId <> ?`,
      [id, userId],
      res
    )
  )[0];
  const homeworkProblems = (await executeAndEndSet500OnError(
    'select problems from homework where id=?',
    [answer.homeworkId],
    res
  ))[0].problems;
  const problem = JSON.parse(homeworkProblems)[answer.questionId];
  res.send({
    answer,
    problem,
  });
}
