import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfPostOrSetError, getUserIdOrSetError } from './comment-utils';
import { queryGradingDbAndEndSet500OnError } from './grading-db-utils';
import { getQuiz } from './quiz-utils';
import {
  Phase,
  InsertAnswerRequest,
  Tristate,
  getCorrectness,
  getProblem,
  getQuizPhase,
} from '@stex-react/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!checkIfPostOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;
  const {
    quizId,
    problemId,
    singleOptionIdx,
    multipleOptionIdxs,
    filledInAnswer,
    browserTimestamp_ms,
  } = req.body as InsertAnswerRequest;

  const quiz = getQuiz(quizId);
  if (!quiz) {
    res.status(400).json({ message: `Quiz not found: [${quizId}]` });
    return;
  }
  const phase = getQuizPhase(quiz);
  if (phase !== Phase.STARTED) {
    const message = `Cannot record response. Phase is ${phase}.`;
    res.status(410).json({ message });
    return;
  }
  const problem = quiz.problems[problemId];
  if (!problem) {
    const message = `Problem not found in ${quizId}: [${problemId}]`;
    res.status(400).json({ message });
    return;
  }

  const correctness = getCorrectness(getProblem(problem, undefined), {
    singleOptionIdx,
    multipleOptionIdxs,
    filledInAnswer,
  });

  const isCorrect =
    correctness === Tristate.TRUE
      ? true
      : correctness === Tristate.FALSE
      ? false
      : null;

  const multipleOptionIdxList = Object.keys(multipleOptionIdxs || {})
    .filter((k) => multipleOptionIdxs[k])
    .join(',');
  const results = await queryGradingDbAndEndSet500OnError(
    'INSERT INTO grading(userId, quizId, problemId, singleOptionIdx, multipleOptionIdxs, filledInAnswer, isCorrect, browserTimestamp_ms) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      userId,
      quizId,
      problemId,
      singleOptionIdx,
      multipleOptionIdxList,
      filledInAnswer,
      isCorrect,
      browserTimestamp_ms,
    ],
    res
  );
  if (!results) return;

  res.status(204).end();
}
