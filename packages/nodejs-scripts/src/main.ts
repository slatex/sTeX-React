import { getAllQuizzes } from '@stex-react/node-utils';
import { getProblem } from '@stex-react/quiz-utils';
import fs from 'fs';

import { exit } from 'process';

if (!process.env.QUIZ_INFO_DIR || !process.env.QUIZ_LMS_INFO_FILE) {
  console.log(
    `Env vars not set. Set them at [nodejs-scripts/.env.local] Exiting.`
  );
  exit(1);
}
export interface Quiz {
  problems: { [problemId: string]: string };
}

const quizzes: any[] = getAllQuizzes();

interface ProblemLmsInfo {
  points: number;
  // todo add more.
}

const LMSInfo: { [quizId: string]: { [problemId: string]: ProblemLmsInfo } } =
  {};
for (const quiz of quizzes) {
  const quizLmsInfo = {};
  for (const [problemId, problemStr] of Object.entries(quiz.problems)) {
    const problem = getProblem(problemStr as string, undefined);
    quizLmsInfo[problemId] = { points: problem.points };
  }
  LMSInfo[quiz.id] = quizLmsInfo;
}

fs.writeFileSync(process.env.QUIZ_LMS_INFO_FILE, JSON.stringify(LMSInfo, null, 2));
console.log(`Wrote to ${process.env.QUIZ_LMS_INFO_FILE}`);
