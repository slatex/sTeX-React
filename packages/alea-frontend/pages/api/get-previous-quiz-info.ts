import { NextApiRequest, NextApiResponse } from 'next';
import { getUserIdOrSetError } from './comment-utils';
import { queryGradingDbAndEndSet500OnError } from './grading-db-utils';
import { getAllQuizzes } from './quiz-utils';
import { getProblem } from '@stex-react/quiz-utils';
import { GetPreviousQuizInfoResponse, PreviousQuizInfo } from '@stex-react/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;
  const result1: Array<any> = await queryGradingDbAndEndSet500OnError(
    `SELECT userId,quizId,sum(points)
    FROM grading
    WHERE (quizId, userId, problemId , browserTimestamp_ms) IN (
        SELECT quizId, userId,problemId, MAX(browserTimestamp_ms) AS browserTimestamp_ms
        FROM grading
        WHERE userId=?
        GROUP BY quizId, userId,problemId
    )
    GROUP BY userId,quizId;`,
    [userId],
    res
  );
  if (!result1) return;

  const result2: Array<any> = await queryGradingDbAndEndSet500OnError(
    `SELECT quizId,avg(score) from(
        SELECT userId,quizId,sum(points) as score
        FROM grading
        WHERE (quizId, userId, problemId , browserTimestamp_ms) IN (
            SELECT quizId, userId,problemId, MAX(browserTimestamp_ms) AS browserTimestamp_ms
            FROM grading
            GROUP BY quizId, userId,problemId
        ) 
        GROUP BY userId,quizId) as t1
        GROUP BY quizId`,
    [],
    res
  );
  if (!result2) return;

  const scoreByQuizId = {};
  result1.forEach((quiz) => {
    scoreByQuizId[quiz.quizId] = quiz['sum(points)'];
  });

  const allQuizzes = getAllQuizzes();
  const maxPointsByQuizId: { [quizId: string]: number } = {};
  allQuizzes.forEach((quiz) => {
    let maxPoint = 0;
    for (const problemId in quiz.problems) {
      maxPoint += getProblem(quiz.problems[problemId], '').points;
    }
    maxPointsByQuizId[quiz.id] = maxPoint;
  });

  const quizInfoObject: { [quizId: string]: PreviousQuizInfo } = {};
  result2.forEach((row: any) => {
    const quizId = row['quizId'];
    const averageScore = row['avg(score)'];
    if (quizId && averageScore !== undefined) {
      quizInfoObject[quizId] = {
        score: scoreByQuizId[quizId],
        averageScore,
        maxPoints: maxPointsByQuizId[quizId],
      };
    }
  });

  const finalResult: GetPreviousQuizInfoResponse = {
    quizinfo: quizInfoObject,
  };
  res.status(200).send(finalResult);
}
