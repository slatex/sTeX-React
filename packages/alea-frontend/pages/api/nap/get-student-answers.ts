import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfGetOrSetError,
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';
import { AnswerResponse } from '@stex-react/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  if (Object.keys(req.query).length > 0) {
    if (req.query.couserId != null) {
      query += 'And Answer.questionId=? ';
      queryPrams.push(req.query.couserId);
    }
  }
  if (!userId) return;
  const answers = await executeAndEndSet500OnError<AnswerResponse[]>(
    `select id,questionId,subProblemId,userId,answer,createdAt,updatedAt,questionTitle from Answer where userId=? order by id desc`,
    [userId],
    res
  );
  res.send(answers);
}
