import {
  PerProblemStats,
  QuizStatsResponse,
  isModerator,
} from '@stex-react/api';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserIdOrSetError } from '../comment-utils';
import {
  queryGradingDbAndEndSet500OnError,
  queryGradingDbDontEndSet500OnError,
} from '../grading-db-utils';
import { getQuiz } from '../quiz-utils';
import { getProblem } from '@stex-react/quiz-utils';

function missingProblemData() {
  return {
    header: 'Missing problem',
    maxPoints: 0,
    correct: 0,
    partial: 0,
    incorrect: 0,
  };
}

function numberBucket(n: number) {
  const lowerBound = Math.floor(n * 2) / 2;
  const upperBound = lowerBound + 0.5;
  return `[${lowerBound}, ${upperBound})`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const quizId = req.query.quizId as string;
  const userId = await getUserIdOrSetError(req, res);
  if (!isModerator(userId)) {
    res.status(403).send({ message: 'Unauthorized.' });
    return;
  }

  const quiz = getQuiz(quizId);
  const perProblemStats: { [problemKey: string]: PerProblemStats } = {};
  for (const [problemId, problemStr] of Object.entries(quiz.problems)) {
    const { points, header } = getProblem(problemStr, '');
    perProblemStats[problemId] = {
      header,
      maxPoints: points,
      correct: 0,
      partial: 0,
      incorrect: 0,
    };
  }
  const totalPoints = Object.values(perProblemStats).reduce(
    (acc, stat) => acc + stat.maxPoints,
    0
  );

  const results1: any[] = await queryGradingDbDontEndSet500OnError(
    `SELECT numProblems, COUNT(*) AS numStudents
    FROM (
      SELECT userId, COUNT(*) AS numProblems
      FROM (
        SELECT problemId, userId
        FROM grading
        WHERE quizId = ?
        GROUP BY problemId, userId
      ) AS T1
      GROUP BY userId
    ) AS T2
    GROUP BY numProblems`,
    [quizId],
    res
  );
  if (!results1) return;
  const attemptedHistogram = {};
  for (const r1 of results1) {
    attemptedHistogram[r1.numProblems] = r1.numStudents;
  }
  const results2: any[] = await queryGradingDbDontEndSet500OnError(
    `SELECT score, COUNT(*) AS numStudents
    FROM (
      SELECT userId, SUM(points) as score
      FROM grading
      WHERE (quizId, problemId, userId, browserTimestamp_ms) IN (
        SELECT quizId, problemId, userId, MAX(browserTimestamp_ms) AS browserTimestamp_ms
        FROM grading
        WHERE quizId = ?
        GROUP BY quizId, problemId, userId
      )
      GROUP BY userId
    ) AS T1
    GROUP BY score`,
    [quizId],
    res
  );
  if (!results2) return;
  const scoreHistogram = {};
  for (const r2 of results2) {
    const { score } = r2;
    let key = '';
    if (score === 0) key = '0';
    else if (score === totalPoints) key = `${score}`;
    else key = numberBucket(score);
    scoreHistogram[key] = r2.numStudents;
  }
  const results3: any[] = await queryGradingDbDontEndSet500OnError(
    `SELECT ROUND(UNIX_TIMESTAMP(postedTimestamp)/10)*10 AS ts, COUNT(*)/10 AS requestsPerSec 
    FROM grading
    WHERE quizId = ?
    GROUP BY ts`,
    [quizId],
    res
  );
  if (!results3) return;
  const requestsPerSec = {};
  for (const r3 of results3) {
    requestsPerSec[r3.ts] = r3.requestsPerSec;
  }

  const results4: any[] = await queryGradingDbAndEndSet500OnError(
    `SELECT quizId, problemId, points, COUNT(*) AS numStudents from grading 
    WHERE (quizId, problemId, userId, browserTimestamp_ms) IN ( 
        SELECT quizId, problemId, userId, MAX(browserTimestamp_ms) AS browserTimestamp_ms
        FROM grading
        WHERE quizId=?
        GROUP BY quizId, problemId, userId
    )
    GROUP BY quizId, problemId, points`,
    [quizId],
    res
  );
  if (!results4) return;

  for (const r4 of results4) {
    const problemId = r4.problemId;
    if (!(problemId in perProblemStats)) {
      perProblemStats[problemId] = missingProblemData();
    }
    if (r4.points <= 0) {
      perProblemStats[problemId].incorrect += r4.numStudents;
    } else if (r4.points < perProblemStats[problemId].maxPoints) {
      perProblemStats[problemId].partial += r4.numStudents;
    } else {
      perProblemStats[problemId].correct += r4.numStudents;
    }
  }

  return res.status(200).json({
    attemptedHistogram,
    scoreHistogram,
    requestsPerSec,
    perProblemStats,
  } as QuizStatsResponse);
}
