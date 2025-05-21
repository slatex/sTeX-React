//alea-frontend/pages/api/quiz/recorrect.ts
import { NextApiRequest, NextApiResponse } from 'next';
import {
  batchGradeHex,
  computePointsFromFeedbackJson,
  FTMLProblemWithSolution,
  ProblemResponse,
} from '@stex-react/api';
import mysql from 'serverless-mysql';
import { getAllQuizzes } from '@stex-react/node-utils';

const db = mysql({
  config: {
    host: process.env.MYSQL_HOST,
    port: +process.env.MYSQL_PORT,
    database: process.env.MYSQL_GRADING_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
  },
});

interface GradingDbData {
  gradingId: number;
  problemId: string;
  quizId: string;
  response: string;
  points: number;
  userId?: string;
}

interface GradingDbDataWithCorrectedPoints extends GradingDbData {
  correctedPoints: number;
}

async function getCorrectedPoints(
  problems: { [problemUri: string]: FTMLProblemWithSolution },
  responses: GradingDbData[]
): Promise<{ results: GradingDbDataWithCorrectedPoints[], missingIds: Record<string, number> }> {
  const withCorrectedPoints: GradingDbDataWithCorrectedPoints[] = [];
  const missingIds: Record<string, number> = {};

  console.log('Grading records:', responses);

  const byProblemId = responses.reduce((acc, result) => {
    const { problemId } = result;
    if (!acc[problemId]) acc[problemId] = [];
    acc[problemId].push(result);
    return acc;
  }, {} as { [problemId: string]: GradingDbData[] });

  for (const problemId in byProblemId) {
    const problem = problems[problemId]?.problem;
    if (!problem) {
      missingIds[problemId] = (missingIds[problemId] || 0) + byProblemId[problemId].length;
      continue;
    }
    const responses: ProblemResponse[] = byProblemId[problemId].map((r) => {
      return JSON.parse(r.response) as ProblemResponse;
    });
    console.log('Responses for problemId', problemId, responses);
    const feedbacks = (await batchGradeHex([[problems[problemId].solution, responses]]))?.[0];
    for (let i = 0; i < (feedbacks?.length ?? 0); i++) {
      const feedback = feedbacks[i];
      const gradingDbData = byProblemId[problemId][i];
      const correctedPoints = computePointsFromFeedbackJson(problem, feedback);
      withCorrectedPoints.push({ ...gradingDbData, correctedPoints });
    }
  }

  return { results: withCorrectedPoints, missingIds };
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { quizId, courseId, courseTerm, dryRun } = req.body;

  console.log('Recorrection request:', { quizId, courseId, courseTerm, dryRun });
  
  if (!quizId || !courseId || !courseTerm) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Get quiz data directly from getAllQuizzes
    const allQuizzes = getAllQuizzes();
    const quiz = allQuizzes.find(q => q.id === quizId && q.courseId === courseId && q.courseTerm === courseTerm);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    // Get all responses for this quiz
    const results: GradingDbData[] = await db.query(
      'SELECT gradingId,userId, problemId, quizId, response, points FROM grading WHERE quizId = ?',
      [quizId]
    );

    console.log(`Found ${results.length} grading records for quiz ${quizId}`);
    
    // Calculate corrected points and collect missing problem info
    const { results: withCorrectedPoints, missingIds } = await getCorrectedPoints(quiz.problems, results);
    
    console.log(`Calculated corrected points for ${withCorrectedPoints.length} grading records`);
    // Filter results with different points
    const changedResults = withCorrectedPoints.filter(
      (result) => Math.abs(result.correctedPoints - result.points) > 0.01
    );
    
    // Format changes for response
    const changes = changedResults.map((result) => ({
      gradingId: result.gradingId,
      problemId: result.problemId,
      oldPoints: result.points,
      newPoints: result.correctedPoints,
      studentId: result.userId,
    }));
    
    // If not dry run, update the database
    if (!dryRun && changes.length > 0) {
      // Update points in database
      const updatePromises = changes.map((change) =>
        db.query('UPDATE grading SET points = ? WHERE gradingId = ?', [
          change.newPoints,
          change.gradingId,
        ])
      );
      
      await Promise.all(updatePromises);
    }
    
    // Logging for backend
    if (Object.keys(missingIds).length > 0) {
      console.warn('Some grading records could not be recorrected due to missing problems:', missingIds);
    }
    if (changes.length === 0) {
      console.info('No grading records needed recorrection.');
    }

    return res.status(200).json({
      changedCount: changes.length,
      changes,
      missingProblems: missingIds,
    });
  } catch (error) {
    console.error('Error in recorrection:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await db.end();
  }
}

export default handler;