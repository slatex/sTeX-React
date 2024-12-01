import { AutogradableResponse, InputType, Problem } from '@stex-react/api';
import { getAllQuizzes } from '@stex-react/node-utils';
import { getProblem } from '@stex-react/quiz-utils';
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

export async function populateResponseColumn() {
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
  const gradingId_to_response = {};
  db.query('SELECT * FROM grading', []).then((results: any[]) => {
    // console.log(results);
    for (const result of results) {
      const {
        gradingId,
        problemId,
        quizId,
        singleOptionIdxs,
        multipleOptionIdxs,
        filledInAnswer,
        response,
      } = result;
      const problem = problems[problemId];
      if (!problem) {
        const pId = quizId + '-' + problemId;
        if (!(pId in missing_ids)) missing_ids[pId] = 0;
        missing_ids[pId]++;
        continue;
      }
      if (response?.length) continue;

      const singleOptionIdxsArr = singleOptionIdxs?.length
        ? singleOptionIdxs.split(',').map((s) => parseInt(s))
        : null;

      const multiIdxs = multipleOptionIdxs?.length ? {} : null;
      if (multiIdxs) {
        multipleOptionIdxs
          ?.split(',')
          .map((s) => parseInt(s))
          .forEach((idx) => (multiIdxs[idx] = true));
      }

      const responses: AutogradableResponse[] = [];
      problem.inputs.forEach((input, idx) => {
        const type = input.type;
        if (type === InputType.FILL_IN) {
          responses.push({ type, filledInAnswer });
        } else if (type === InputType.MCQ) {
          responses.push({ type, multipleOptionIdxs: multiIdxs });
        } else if (type === InputType.SCQ) {
          let singleOptionIdx;
          if (
            !singleOptionIdxs ||
            idx >= singleOptionIdxsArr.length ||
            singleOptionIdxsArr[idx] < 0
          ) {
            singleOptionIdx = '';
          } else {
            singleOptionIdx = singleOptionIdxsArr[idx].toString();
          }
          responses.push({ type, singleOptionIdx });
        }
      });

      const r = JSON.stringify(responses);
      gradingId_to_response[gradingId] = r;
    }

    console.log('\nProblem not found for:');
    console.log(missing_ids);

    console.log('\nAdd json data:');
    const queries = Object.keys(gradingId_to_response).map((gradingId) => {
      const query = `UPDATE grading SET response = ? WHERE gradingId = ${gradingId}`;
      return { query, json: gradingId_to_response[gradingId] };
    });
    console.log(queries.length);
    /*Promise.all(queries.map(({ query, json }) => db.query(query, [json]))).then(
      (_) => console.log('Score Updated')
    );*/
  });
}
