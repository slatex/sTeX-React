import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfPostOrSetError,
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';
import { AnswerClass } from '@stex-react/api';
import { isNull, sumBy } from 'lodash';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  const [customFeedback, answerId, answerTails] = req.body;
  const answerClasses = answerTails as AnswerClass[];
  if (!answerId || answerClasses.length == 0) {
    res.status(422).end();
  }
  answerClasses.forEach((element) => {
    if (
      !element.answerClassId ||
      isNull(element.closed) ||
      !element.description ||
      !element.title ||
      !element.points
    )
      res.status(422).end();
    return;
  });
  const gradingResult = await executeAndEndSet500OnError(
    'INSERT INTO Grading (checkerId,answerId,customFeedback,totalPoints) values (?,?,?,?)',
    [userId, answerId, customFeedback, sumBy(answerClasses, (c) => c.points)],
    res
  );
  console.log(gradingResult);
  
}
