import { NextApiRequest, NextApiResponse } from 'next';
import { getAllQuizzes } from '@stex-react/node-utils';
import { Excused, getExcused, QuizWithStatus } from '@stex-react/api';
import { queryGradingDbAndEndSet500OnError } from '../grading-db-utils';
import { checkIfPostOrSetError } from '../comment-utils';
import { getUserIdIfAuthorizedOrSetError } from '../access-control/resource-utils';
import { Action, ResourceName } from '@stex-react/utils';

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if(!checkIfPostOrSetError(req, res)) return;
  const { 
    courseId, 
    courseTerm, 
    excludeQuizzes = [] ,
    topN
  } = req.body;
  
  if (!courseId || !courseTerm) {
    return res.status(400).send("courseId and courseTerm are required");
  }

  const instructorId = await getUserIdIfAuthorizedOrSetError(
    req,
    res,
    ResourceName.COURSE_QUIZ,
    Action.MUTATE,
    { courseId, instanceId: courseTerm }    
  );
  if (!instructorId) return;

  try {
    const quizzes: QuizWithStatus[] = getAllQuizzes()
      .sort((a, b) => a.quizStartTs - b.quizStartTs)
      .filter(
        (quiz) =>
          quiz.courseId === courseId &&
          quiz.courseTerm === courseTerm &&
          !excludeQuizzes.includes(quiz.id)
      );

    if (quizzes.length === 0) {
      return res.status(404).send("No quizzes found for the specified course");
    }

    const MAX_POINTS: Record<string, number> = {};
    for (const quiz of quizzes) {
      MAX_POINTS[quiz.id] = 0;
      for (const ftmlProblem of Object.values(quiz.problems)) {
        MAX_POINTS[quiz.id] += ftmlProblem?.problem?.total_points ?? 1;
      }
    }

    const quizIds = quizzes.map((q) => q.id);
    const placeholders = quizIds.map(() => '?').join(', ');
    
    const results: any[] = await queryGradingDbAndEndSet500OnError(
      `SELECT userId, quizId, sum(points) as score
      FROM grading
      WHERE (quizId, userId, problemId, browserTimestamp_ms) IN (
        SELECT quizId, userId, problemId, MAX(browserTimestamp_ms) AS browserTimestamp_ms
        FROM grading
        WHERE quizId IN (${placeholders})
        GROUP BY quizId, userId, problemId
      )
      GROUP BY userId, quizId`,
      quizIds,
      res
    );

    const excusedData: Record<string, string[]> = {};
    
    for (const quiz of quizzes) {
      try {
        const excusedStudents = await getExcused(quiz.id, courseId, courseTerm);
        excusedData[quiz.id] = excusedStudents;
      } catch (error) {
        console.warn(`Failed to get excused students for quiz ${quiz.id}:`, error);
        excusedData[quiz.id] = [];
      }
    }

    const USER_ID_TO_QUIZ_SCORES: Record<string, UserQuizData> = {};
    
    for (const result of results) {
      const { userId, quizId, score } = result;
      
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

      const excusedQuizzes = Object.values(excusedData)
        .filter(userIds => userIds.includes(userId)).length;

      const remainingQuizzesAfterExcuses = topN - excusedQuizzes;
      
      if (remainingQuizzesAfterExcuses > 0) {
        userData.sumTopN =
          quizPercentages.slice(0, remainingQuizzesAfterExcuses).reduce((a, b) => a + b, 0) /
          remainingQuizzesAfterExcuses;
      } else {
        userData.sumTopN = 0;
      }
    }

    const csvLines: string[] = [];
    const header = [
      'user_id',
      ...quizzes.flatMap((quiz, idx) => [`(${idx + 1}) ${quiz.id}`, `(${idx + 1}) ${quiz.id} %`]),
      `Top ${topN} avg %`,
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

    return res.status(200).json({
      message: 'End semester summary generated successfully',
      csvData: csvLines.join('\n')
    });

  } catch (error) {
    console.error('Error generating end semester summary:', error);
    return res.status(500).json({ 
      error: 'Internal server error while generating summary',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}