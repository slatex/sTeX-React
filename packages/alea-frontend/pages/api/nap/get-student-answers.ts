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
  let query = 'where userId=? ';
  const queryPrams: any[] = [userId];
  if (Object.keys(req.query).length > 0) {
    if (req.query.couserId != null) {
      query += 'And couserId=? ';
      queryPrams.push(req.query.couserId);
    }
    if (req.query.questionId != null) {
      query += 'And questionId=? ';
      queryPrams.push(req.query.questionId);
    }
    if (req.query.subProblemId != null) {
      query += 'And subProblemId =? ';
      queryPrams.push(req.query.subProblemId);
    }
  }
  if (!userId) return;
  const answers = await executeAndEndSet500OnError<AnswerResponse[]>(
    `select id,questionId,subProblemId,userId,answer,createdAt,updatedAt,questionTitle from Answer ${query} order by id desc`,
    queryPrams,
    res
  );
  res.send(answers);
}
