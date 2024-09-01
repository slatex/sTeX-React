import { NextApiRequest, NextApiResponse } from 'next';
import { getAllQuizzes } from '../quiz/quiz-utils';
import { queryGradingDbAndEndSet500OnError } from '../grading-db-utils';
import { getUserIdOrSetError } from '../comment-utils';
import { isModerator } from '@stex-react/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = await getUserIdOrSetError(req, res);
  // if (!isModerator(userId)) {
  //   res.status(403).send({ message: 'Unauthorized.' });
  //   return;
  // }
  // this api is not yet used anywhere, 
  const courseId = req.query.courseId as string;
  if (!courseId) {
    res.status(400).json({ message: 'Missing courseId.' });
    return;
  }

  const quizzes = getAllQuizzes().filter((q) => q.courseId === courseId);
  const quizIds = quizzes.map((quiz) => quiz.id);
  const result: any[] = await queryGradingDbAndEndSet500OnError(
    `SELECT userId from grading where quizId in (?) group by userId;`,
    [quizIds],
    res
  );
  if (!result) {
    return;
  }
  const userIds = result.map((user) => user.userId);
  res.status(200).json(userIds);
}
