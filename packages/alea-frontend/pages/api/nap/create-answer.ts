import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfPostOrSetError,
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';
import { CreateAnswerRequest } from '@stex-react/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  const { answer,questionId, questionTitle } = req.body as CreateAnswerRequest;
  if (!answer || !questionId || !questionTitle) res.status(422).end();
  const result = await executeAndEndSet500OnError(
    `INSERT INTO Answer (questionId, userId, answer,question_title) VALUES (?,?,?,?)`,
    [questionId, userId, answer, questionTitle],
    res
  );
  res.status(201).send({ id: result.insertId });
}
