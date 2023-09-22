import { Quiz, isModerator } from '@stex-react/api';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfPostOrSetError, getUserIdOrSetError } from './comment-utils';
import { doesQuizExist, getQuizFilePath } from './quiz-utils';

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
  const {
    quizStartTs,
    quizEndTs,
    feedbackReleaseTs,
    manuallySetPhase,
    title,
    problems,
  } = req.body as Quiz;
  const quiz = {
    id: 'quiz-' + crypto.randomUUID().substring(0, 8),
    version: 0,

    quizStartTs,
    quizEndTs,
    feedbackReleaseTs,
    manuallySetPhase,

    title,
    problems,

    updatedAt: Date.now(),
    updatedBy: userId,
  };

  if (doesQuizExist(quiz.id)) {
    res.status(500).json({ message: 'Quiz file already exists!' });
    return;
  }

  const filePath = getQuizFilePath(quiz.id);
  fs.writeFileSync(filePath, JSON.stringify(quiz, null, 2));
  res.status(200).json({ message: 'Quiz updated successfully!' });
}
