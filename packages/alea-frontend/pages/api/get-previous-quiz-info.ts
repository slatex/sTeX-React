import { NextApiRequest, NextApiResponse } from 'next';
import { getUserIdOrSetError } from './comment-utils';
import { queryGradingDbAndEndSet500OnError } from './grading-db-utils';
import { getAllQuizzes } from './quiz-utils';
import { getProblem } from '@stex-react/quiz-utils';
import {
  GetPreviousQuizInfoResponse,
  PreviousQuizInfo,
  Problem,
  RecorrectionInfo,
} from '@stex-react/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;
  const result1: Array<any> = await queryGradingDbAndEndSet500OnError(
    `SELECT userId, quizId, sum(points) as score
    FROM grading
    WHERE (quizId, userId, problemId, browserTimestamp_ms) IN (
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
    `SELECT quizId, avg(score) as avgScore from(
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
    scoreByQuizId[quiz.quizId] = quiz['score'];
  });

  const allQuizzes = getAllQuizzes();
  const staticQuizInfoById: {
    [quizId: string]: {
      maxPoints: number;
      recorrectionInfo?: RecorrectionInfo[];
    };
  } = {};
  allQuizzes.forEach((quiz) => {
    const { problems, recorrectionInfo } = quiz;
    const problemByProblemId: { [problemId: string]: Problem } = {};
    for (const problemId in problems) {
      problemByProblemId[problemId] = getProblem(problems[problemId]);
    }
    const maxPoints = Object.values(problemByProblemId).reduce(
      (acc, { points }) => acc + points,
      0
    );
    for (const r of recorrectionInfo || []) {
      r.problemHeader = problemByProblemId[r.problemId].header;
    }
    staticQuizInfoById[quiz.id] = { maxPoints, recorrectionInfo };
  });

  const quizInfo: { [quizId: string]: PreviousQuizInfo } = {};
  result2.forEach((row: any) => {
    const quizId = row['quizId'];
    const averageScore = row['avgScore'];
    const staticInfo = staticQuizInfoById[quizId];
    if (!staticInfo || !quizId || averageScore === undefined) return;
    const { maxPoints, recorrectionInfo } = staticInfo;
    const score = scoreByQuizId[quizId];
    quizInfo[quizId] = { score, averageScore, maxPoints, recorrectionInfo };
  });

  res.status(200).send({ quizInfo } as GetPreviousQuizInfoResponse);
}
