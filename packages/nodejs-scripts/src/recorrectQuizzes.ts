import {
  batchGradeHex,
  computePointsFromFeedbackJson,
  FTMLProblemWithSolution,
  ProblemResponse,
} from '@stex-react/api';
import { getAllQuizzes } from '@stex-react/node-utils';
import { exit } from 'process';
import mysql from 'serverless-mysql';

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
}

interface GradingDbDataWithCorrectedPoints extends GradingDbData {
  correctedPoints: number;
}

async function getCorrectedPoints(
  problems: { [problemUri: string]: FTMLProblemWithSolution },
  responses: GradingDbData[]
): Promise<GradingDbDataWithCorrectedPoints[]> {
  const withCorrectedPoints: GradingDbDataWithCorrectedPoints[] = [];
  const missing_ids = {};

  const byProblemId = responses.reduce((acc, result) => {
    const { problemId } = result;
    if (!acc[problemId]) acc[problemId] = [];
    acc[problemId].push(result);
    return acc;
  }, {} as { [problemId: string]: GradingDbData[] });

  for (const problemId in byProblemId) {
    const problem = problems[problemId]?.problem;
    if (!problem) {
      missing_ids[problemId] = (missing_ids[problemId] || 0) + 1;
      continue;
    }
    const responses: ProblemResponse[] = byProblemId[problemId].map((r) => {
      return JSON.parse(r.response) as ProblemResponse;
    });
    const feedbacks = (await batchGradeHex([[problems[problemId].solution, responses]]))?.[0];
    for (let i = 0; i < responses.length; i++) {
      const feedback = feedbacks[i];
      const gradingDbData = byProblemId[problemId][i];
      const correctedPoints = computePointsFromFeedbackJson(problem, feedback);
      withCorrectedPoints.push({ ...gradingDbData, correctedPoints });
    }
  }
  console.log('Missing ids:', missing_ids);

  return withCorrectedPoints;
}

export async function recorrectQuizzes() {
  if (!process.env.QUIZ_INFO_DIR || !process.env.MYSQL_HOST || !process.env.NEXT_PUBLIC_FLAMS_URL) {
    console.log(`Env vars not set. Set them at [nodejs-scripts/.env.local] Exiting.`);
    exit(1);
  }

  const quizzes = getAllQuizzes();

  const problems: { [problemUri: string]: FTMLProblemWithSolution } = {};
  for (const quiz of quizzes) {
    for (const [problemId, problem] of Object.entries(quiz.problems)) {
      problems[problemId] = problem;
    }
  }
  const wrong_points_problem_ids = {};
  const gradingId_to_updated_points = {};

  db.query('SELECT * FROM grading WHERE browserTimestamp_ms > 1745366400000', []) // After 2024/04/23 0:00
    .then(async (results: GradingDbData[]) => {
      return getCorrectedPoints(problems, results);
    })
    .then((results: GradingDbDataWithCorrectedPoints[]) => {
      for (const result of results) {
        const { correctedPoints, points, gradingId, problemId, response, quizId } = result;
        if (Math.abs(correctedPoints - points) > 0.01) {
          console.log(
            `gradingId: ${gradingId} problem: ${quizId} ${problemId} expectedPts: ${correctedPoints} assignedPts: ${points} response: ${response}`
          );
          if (!(problemId in wrong_points_problem_ids)) wrong_points_problem_ids[problemId] = 0;
          wrong_points_problem_ids[problemId]++;
          gradingId_to_updated_points[gradingId] = correctedPoints;
        }
      }

      console.log('Points need to be updated: ');
      console.log(wrong_points_problem_ids);

      // console.log('\nProblem not found for:');
      // console.log(missing_ids);

      console.log('\nFix points for:');
      console.log(gradingId_to_updated_points);
      const queries = Object.keys(gradingId_to_updated_points).map(
        (gradingId) =>
          `UPDATE grading SET points = ${gradingId_to_updated_points[gradingId]} WHERE gradingId = ${gradingId}`
      );
      console.log(queries);
      // Promise.all(queries.map(query=>db.query(query))).then(_=>console.log('Score Updated'));
    });
}
