import { NextApiRequest, NextApiResponse } from 'next';
import { queryGradingDbAndEndSet500OnError } from './grading-db-utils';
import { getUserIdOrSetError } from './comment-utils';
import {
  isModerator,
  DiligenceAndPerformanceData,
  UserAnonData,
} from '@stex-react/api';
import { queryMatomoDbAndEndSet500OnError } from './matomo-db-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = await getUserIdOrSetError(req, res);
  if (!isModerator(userId)) {
    res.status(403).send({ message: 'Unauthorized.' });
    return;
  }
  const quizInfo: any[] = await queryGradingDbAndEndSet500OnError(
    `SELECT userId, quizId, SUM(points) as quiz_score
    FROM grading
    WHERE (quizId, problemId, userId, browserTimestamp_ms) IN (
      SELECT quizId, problemId, userId, MAX(browserTimestamp_ms) AS browserTimestamp_ms
      FROM grading.grading
      GROUP BY quizId, problemId, userId
    )
    GROUP BY userId, quizId`,
    [],
    res
  );
  if (!quizInfo) return;

  const userData: { [userId: string]: DiligenceAndPerformanceData } = {};
  for (const row of quizInfo) {
    const { userId, quizId, quiz_score } = row;
    if (!userData[userId])
      userData[userId] = { visitTime_sec: 0, quizScores: {} };
    userData[userId].quizScores[quizId] = quiz_score;
  }

  const visitInfo: any[] = await queryMatomoDbAndEndSet500OnError(
    `SELECT user_id, SUM(visit_total_time) visit_time 
FROM matomo.matomo_log_visit 
WHERE user_id IS NOT NULL AND visit_last_action_time >= '2023-10-01'  
GROUP BY user_id`,
    [],
    res
  );
  if (!visitInfo) return;
  for (const row of visitInfo) {
    const { userId, visit_time } = row;
    if (userId in userData) userData[userId].visitTime_sec = visit_time;
  }
  const userIds = Object.keys(userData).sort(() => 0.5 - Math.random());
  for(const [idx, userId] of userIds.entries()) {
    userData[idx] = userData[userId];
    delete userData[userId];
  }
  res.status(200).json({ userData } as UserAnonData);
}
