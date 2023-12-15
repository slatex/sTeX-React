import { NextApiRequest, NextApiResponse } from 'next';
import { queryGradingDbAndEndSet500OnError } from './grading-db-utils';
import { getUserIdOrSetError } from './comment-utils';
import {
  isModerator,
  DiligenceAndPerformanceData,
  UserAnonData,
} from '@stex-react/api';
import { queryMatomoDbAndEndSet500OnError } from './matomo-db-utils';

// SELECT user_id as userId, SUM(visit_total_time) visit_time  FROM matomo.matomo_log_visit  WHERE user_id IS NOT NULL AND visit_first_action_time >= '2023-10-01 10:00:00' AND visit_last_action_time <= '2023-10-30 10:00:00'   GROUP BY user_id

const QUIZ_DATA = [
  {
    quizId: 'quiz-d1a3f406',
    prepStartTime: '2023-10-18 06:15:00',
    prepEndTime: '2023-10-24 15:05:00',
  },
  {
    quizId: 'quiz-079df087',
    prepStartTime: '2023-10-24 15:11:00',
    prepEndTime: '2023-10-31 16:05:00',
  },
  {
    quizId: 'quiz-6d09501f',
    prepStartTime: '2023-10-31 16:25:00',
    prepEndTime: '2023-11-07 15:15:00',
  },
  {
    quizId: 'quiz-07067709',
    prepStartTime: '2023-11-07 15:25:00',
    prepEndTime: '2023-11-14 15:15:00',
  },
];
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = await getUserIdOrSetError(req, res);
  if (!isModerator(userId)) {
    res.status(403).send({ message: 'Unauthorized.' });
    return;
  }
  const scoreInfo: any[] = await queryGradingDbAndEndSet500OnError(
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
  if (!scoreInfo) return;

  const userData: { [userId: string]: DiligenceAndPerformanceData } = {};
  for (const row of scoreInfo) {
    const { userId, quizId, quiz_score } = row;
    if (!userData[userId]) userData[userId] = { quizInfo: {} };
    userData[userId].quizInfo[quizId] = { quiz_score };
  }

  for (const quiz of QUIZ_DATA) {
    const { quizId, prepStartTime, prepEndTime } = quiz;
    const visitInfo: any[] = await queryMatomoDbAndEndSet500OnError(
      `SELECT user_id as userId, SUM(visit_total_time) visit_time 
      FROM matomo.matomo_log_visit 
      WHERE 
        user_id IS NOT NULL AND
        visit_first_action_time >= ? AND 
        visit_last_action_time <= ?  
      GROUP BY user_id`,
      [prepStartTime, prepEndTime],
      res
    );
    if (!visitInfo) return;
    for (const row of visitInfo) {
      const { userId, visit_time } = row;
      if (userData[userId]) {
        if (!userData[userId][quizId])
          userData[userId].quizInfo[quizId] = { quiz_score: 0 };
        userData[userId].quizInfo[quizId] = visit_time;
      }
    }
  }
  const userIds = Object.keys(userData).sort(() => 0.5 - Math.random());
  for (const [idx, userId] of userIds.entries()) {
    userData[idx] = userData[userId];
    delete userData[userId];
  }
  res
    .status(200)
    .json({
      userData,
      quizIds: QUIZ_DATA.map((q) => q.quizId),
    } as UserAnonData);
}
