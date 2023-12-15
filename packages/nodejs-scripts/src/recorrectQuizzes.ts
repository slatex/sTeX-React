import { getAllQuizzes } from '@stex-react/node-utils';
import { getPoints, getProblem } from '@stex-react/quiz-utils';
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

import { InputResponse, Problem } from '@stex-react/api';
import { exit } from 'process';

if (!process.env.QUIZ_INFO_DIR || !process.env.MYSQL_HOST) {
  console.log(
    `Env vars not set. Set them at [nodejs-scripts/.env.local] Exiting.`
  );
  exit(1);
}

const quizzes = getAllQuizzes();

const problems: { [problemId: string]: Problem } = {};
for (const quiz of quizzes) {
  for (const [problemId, problemStr] of Object.entries(quiz.problems)) {
    const problem = getProblem(problemStr as string, undefined);
    problems[problemId] = problem;
  }
}
const missing_ids = {};
const wrong_points_problem_ids = {};
const gradingId_to_updated_points = {};
db.query('SELECT * FROM grading', []).then((results: any[]) => {
  // console.log(results);
  for (const result of results) {
    const { gradingId, problemId, quizId, response, points } = result;

    const problem = problems[problemId];
    if (!problem) {
      const pId = quizId + '-' + problemId;
      if (!(pId in missing_ids)) {
        missing_ids[pId] = 0;
      }
      missing_ids[pId]++;
      continue;
    }
    const responses: InputResponse[] = JSON.parse(response);

    const expectedPts = getPoints(problem, { responses });
    if (Math.abs(expectedPts - points) > 0.01) {
      console.log(
        `gradingId: ${gradingId} problem: ${quizId} ${problemId} expectedPts: ${expectedPts} assignedPts: ${points} response: ${response}`
      );
      if (!(problemId in wrong_points_problem_ids))
        wrong_points_problem_ids[problemId] = 0;
      wrong_points_problem_ids[problemId]++;
      gradingId_to_updated_points[gradingId] = expectedPts;
    }
  }

  console.log('Points need to be updated: ');
  console.log(wrong_points_problem_ids);

  console.log('\nProblem not found for:');
  console.log(missing_ids);

  console.log('\nFix points for:');
  console.log(gradingId_to_updated_points);
  const queries = Object.keys(gradingId_to_updated_points).map(
    (gradingId) =>
      `UPDATE grading SET points = ${gradingId_to_updated_points[gradingId]} WHERE gradingId = ${gradingId}`
  );
  console.log(queries);
  // Promise.all(queries.map(query=>db.query(query))).then(_=>console.log('Score Updated'));
});
