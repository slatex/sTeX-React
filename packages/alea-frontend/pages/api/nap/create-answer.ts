import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfPostOrSetError,
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';
import { CreateAnswerRequest } from '@stex-react/api';
import { CURRENT_TERM } from '@stex-react/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;
  const { questionId, questionTitle, subProblemId, courseId, homeworkId } =
    req.body as CreateAnswerRequest;
  let { courseInstance, answer } = req.body as CreateAnswerRequest;
  if (!answer || !questionId || !questionTitle) return res.status(422).end();
  if (!courseInstance) courseInstance = CURRENT_TERM;
  answer = answer.trim();
  const result = await executeAndEndSet500OnError(
    `INSERT INTO Answer (questionId, userId, answer,questionTitle,subProblemId,courseId,courseInstance,homeworkId) VALUES (?,?,?,?,?,?,?,?)`,
    [questionId, userId, answer, questionTitle, subProblemId, courseId, courseInstance, homeworkId],
    res
  );
  if(!result) return;
  res.status(201).send({ id: result.insertId });
}
