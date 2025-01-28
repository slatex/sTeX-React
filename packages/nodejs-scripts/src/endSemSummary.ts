import { getAllQuizzes } from '@stex-react/node-utils';
import { getProblem } from '@stex-react/quiz-utils';
import mysql from 'serverless-mysql';
import fs from 'fs';
import { exit } from 'process';

const db = mysql({
  config: {
    host: process.env.MYSQL_HOST,
    port: +process.env.MYSQL_PORT,
    database: process.env.MYSQL_GRADING_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
  },
});

const TO_BE_EXCUSED = {
  'ai-1': {
    'quiz-e02ee9f5': [
      'li24qeku', // Xinyue Zhang
      'ki61hevu', // Jingxuan Yang
    ],
  },
  lbs: {
    'quiz-0bc0d1ca': [
      'er86inin', // Mahmoud Mohamed
    ],
  },
};

export interface QuizData {
  score: number;
  percentage: number;
}

export interface UserQuizData {
  perQuiz: Record<string, QuizData>;
  sumTopN: number;
}

function to2DecimalPoints(num: number) {
  return Math.round(num * 100) / 100;
}
export function endSemSummary() {
  if (!process.env.QUIZ_INFO_DIR || !process.env.QUIZ_LMS_INFO_FILE) {
    console.log(`Env vars not set. Set them at [nodejs-scripts/.env.local] Exiting.`);
    exit(1);
  }
  const TO_EXCLUDE_QUIZZES = ['quiz-bc71f711'];
  const TOP_N = 10;
  const quizzes: any[] = getAllQuizzes()
    .sort((a, b) => a.quizStartTs - b.quizStartTs)
    .filter(
      (quiz) =>
        quiz.courseId === process.env.QUIZ_SUMMARY_COURSE_ID &&
        quiz.courseTerm === process.env.QUIZ_SUMMARY_COURSE_TERM
    );
  const MAX_POINTS: Record<string, number> = {};
  for (const quiz of quizzes) {
    MAX_POINTS[quiz.id] = 0;
    for (const problemStr of Object.values(quiz.problems)) {
      const problem = getProblem(problemStr as string, undefined);
      MAX_POINTS[quiz.id] += problem.points;
    }
  }

  const quizIds = quizzes.map((q) => q.id);
  const placeholders = quizIds.map(() => '?').join(', ');
  db.query(
    `SELECT userId, quizId, sum(points) as score
FROM grading
WHERE (quizId, userId, problemId, browserTimestamp_ms) IN (
  SELECT quizId, userId,problemId, MAX(browserTimestamp_ms) AS browserTimestamp_ms
  FROM grading
  WHERE quizId IN (${placeholders})
  GROUP BY quizId, userId,problemId
)
GROUP BY userId,quizId`,
    quizIds
  ).then((results: any[]) => {
    const USER_ID_TO_QUIZ_SCORES: Record<string, UserQuizData> = {};
    for (const result of results) {
      const { userId, quizId, score } = result;
      if (TO_EXCLUDE_QUIZZES.includes(quizId)) continue;
      if (!USER_ID_TO_QUIZ_SCORES[userId]) {
        USER_ID_TO_QUIZ_SCORES[userId] = { perQuiz: {}, sumTopN: 0 };
      }
      USER_ID_TO_QUIZ_SCORES[userId].perQuiz[quizId] = {
        score,
        percentage: (score / MAX_POINTS[quizId]) * 100,
      };
    }

    for (const [userId, userData] of Object.entries(USER_ID_TO_QUIZ_SCORES)) {
      const quizPercentages = Object.values(userData.perQuiz).map(
        (quizData) => quizData.percentage
      );
      quizPercentages.sort((a, b) => b - a);

      const excusedQuizzes = Object.entries(
        TO_BE_EXCUSED[process.env.QUIZ_SUMMARY_COURSE_ID] || {}
      ).filter(([_, userIds]) => (userIds as string[]).includes(userId)).length;

      const remainingQuizzesAfterExcuses = TOP_N - excusedQuizzes;
      const scalingFactor = remainingQuizzesAfterExcuses / TOP_N;
      userData.sumTopN = quizPercentages.slice(0, TOP_N).reduce((a, b) => a + b, 0) / TOP_N;
      if (excusedQuizzes > 0) {
        userData.sumTopN *= scalingFactor;
      }
    }

    // Write to csv
    const csvLines: string[] = [];
    const header = [
      'user_id',
      ...quizzes.flatMap((quiz, idx) => [`(${idx + 1}) ${quiz.id}`, `(${idx + 1}) ${quiz.id} %`]),
      `Top ${TOP_N} avg %`,
    ];
    csvLines.push(header.join(','));

    for (const [userId, userData] of Object.entries(USER_ID_TO_QUIZ_SCORES)) {
      const line: (string | number)[] = [];
      line.push(userId);
      for (const quiz of quizzes) {
        if (userData.perQuiz[quiz.id]) {
          line.push(
            to2DecimalPoints(userData.perQuiz[quiz.id].score),
            to2DecimalPoints(userData.perQuiz[quiz.id].percentage)
          );
        } else {
          line.push(0, 0);
        }
      }
      line.push(to2DecimalPoints(userData.sumTopN));
      csvLines.push(line.join(','));
    }

    const writeLocation = `/srv/data/quiz-info/end-sem-summary.csv`;
    fs.writeFileSync(writeLocation, csvLines.join('\n'));
    console.log(`Wrote to ${writeLocation}`);
  });
}
