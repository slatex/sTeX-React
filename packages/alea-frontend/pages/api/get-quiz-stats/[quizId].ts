import { isModerator } from '@stex-react/api';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserIdOrSetError } from '../comment-utils';
import {
  queryGradingDbAndEndSet500OnError,
  queryGradingDbDontEndSet500OnError,
} from '../grading-db-utils';

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
  const results2: any[] = await queryGradingDbAndEndSet500OnError(
    `SELECT score, COUNT(*) AS numStudents
    FROM (
      SELECT userId, COUNT(*) as score
      FROM grading
      WHERE (quizId, problemId, userId, browserTimestamp_ms) IN (
        SELECT quizId, problemId, userId, MAX(browserTimestamp_ms) AS browserTimestamp_ms
        FROM grading
        WHERE quizId = ?
        GROUP BY quizId, problemId, userId
      )
      AND isCorrect = true
      GROUP BY userId
    ) AS T1
    GROUP BY score`,
    [quizId],
    res
  );
  const scoreHistogram = {};
  for (const r2 of results2) {
    scoreHistogram[r2.score] = r2.numStudents;
  }
  if (!results2) return;
  return res.status(200).json({ attemptedHistogram, scoreHistogram });
}
