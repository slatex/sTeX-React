import { CURRENT_TERM } from '@stex-react/utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { getAllQuizzes } from '../get-all-quizzes';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const courseId = req.query.courseId as string;
  if (!courseId) {
    res.status(400).send({ message: 'Missing courseId.' });
    return;
  }

  const quizzesInfo = getAllQuizzes()
    .filter((q) => q.courseId === courseId && q.courseTerm === CURRENT_TERM)
    .map((q) => ({ quizId: q.id, quizStartTs: q.quizStartTs }));

  res.status(200).json(quizzesInfo);
}
