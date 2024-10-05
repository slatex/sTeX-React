import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfPostOrSetError,
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';
import { CreateGradingRequest } from '@stex-react/api';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;
  const { answerId } = req.body as CreateGradingRequest;
  let { customFeedback, answerClasses } = req.body as CreateGradingRequest;
  answerClasses = answerClasses.filter((c) => c.count != 0);
  customFeedback = customFeedback?.trim();
  if (!answerId || answerClasses.length == 0) {
    
    res.status(422).end();
    return;
  }
  answerClasses.forEach((element) => {
    if (
      !element.answerClassId ||
      element.closed == null ||
      element.isTrait == null ||
      // !element.description ||
      !element.title ||
      !element.points
    )
      res.status(422).end();
    return;
  });
  const values = new Array(answerClasses.length).fill(
    '(?, ?, ?,?,?,?,?,?)'
  );
  let totalPoints = 0;
  for (const answerClass of answerClasses) {
    totalPoints += answerClass.count * answerClass.points;
  }
  const gradingResult = await executeAndEndSet500OnError(
    'INSERT INTO Grading (checkerId,answerId,customFeedback,totalPoints) values (?,?,?,?)',
    [userId, answerId, customFeedback, totalPoints],
    res
  );
  const answerClassesParams = answerClasses
    .flatMap((c) => [
      gradingResult.insertId,
      c.answerClassId,
      c.points,
      c.isTrait,
      c.closed,
      c.title,
      c.description,
      c.count,
    ]);
  await executeAndEndSet500OnError(
    `INSERT INTO GradingAnswerClass (gradingId,answerClassId,points,isTrait,closed,title,description,count) values ${values.join(
      ', '
    )}`,
    answerClassesParams,
    res
  );
  res.status(201).end();
}
