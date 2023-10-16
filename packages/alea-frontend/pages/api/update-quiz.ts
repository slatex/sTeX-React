import { Quiz, isModerator } from '@stex-react/api';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfPostOrSetError, getUserIdOrSetError } from './comment-utils';
import {
  doesQuizExist,
  getBackupQuizFilePath,
  getQuiz,
  writeQuizFile
} from './quiz-utils';

// function to rewrite the quiz file with the new quiz info and backup the old version.
export function updateQuiz(
  quizId,
  updatedQuizFunc: (existingQuiz: Quiz) => Quiz
) {
  // Save old version
  const existingQuiz = getQuiz(quizId);
  fs.writeFileSync(
    getBackupQuizFilePath(quizId, existingQuiz.version),
    JSON.stringify(existingQuiz, null, 2)
  );
  const updatedQuiz = updatedQuizFunc(existingQuiz);
  writeQuizFile(updatedQuiz);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!checkIfPostOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  if (!isModerator(userId)) {
    res.status(403).send({ message: 'Unauthorized.' });
    return;
  }
  const quiz = req.body as Quiz;
  if (!doesQuizExist(quiz?.id)) {
    res.status(400).json({ message: `Quiz not found: [${quiz?.id}]` });
    return;
  }

  updateQuiz(
    quiz.id,
    (existingQuiz) =>
      ({
        id: existingQuiz.id,
        version: existingQuiz.version + 1,

        courseId: quiz.courseId,
        courseTerm: existingQuiz.courseTerm,
        quizStartTs: quiz.quizStartTs,
        quizEndTs: quiz.quizEndTs,
        feedbackReleaseTs: quiz.feedbackReleaseTs,
        manuallySetPhase: quiz.manuallySetPhase,

        title: quiz.title,
        problems: quiz.problems,

        updatedAt: Date.now(),
        updatedBy: userId,
      } as Quiz)
  );

  res.status(204).end();
}
