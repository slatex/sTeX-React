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
  if (!userId) return;
  const { questionId, questionTitle, subProblemId, courseId } = req.body as CreateAnswerRequest;
  let { courseInstance, answer } = req.body as CreateAnswerRequest;
  if (!answer || !questionId || !questionTitle) res.status(422).end();
  if (!courseInstance) courseInstance = 'current';
  answer = answer.trim();
  const result = await executeAndEndSet500OnError(
    `INSERT INTO Answer (questionId, userId, answer,questionTitle,subProblemId,courseId,courseInstance) VALUES (?,?,?,?,?,?)`,
    [questionId, userId, answer, questionTitle, subProblemId, courseId,courseInstance],
    res
  );
  res.status(201).send({ id: result.insertId });
}
