import { Quiz, isModerator } from '@stex-react/api';
import { CURRENT_TERM } from '@stex-react/utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { checkIfTypeOrSetError, getUserIdOrSetError } from './comment-utils';
import { doesQuizExist, writeQuizFile } from '@stex-react/node-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!checkIfTypeOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  if (!isModerator(userId)) {
    res.status(403).send({ message: 'Unauthorized.' });
    return;
  }
  const {
    courseId,
    quizStartTs,
    quizEndTs,
    feedbackReleaseTs,
    manuallySetPhase,
    title,
    problems,
  } = req.body as Quiz;
  const quiz = {
    id: 'quiz-' + uuidv4().substring(0, 8),
    version: 0,

    courseId,
    courseTerm: CURRENT_TERM,
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

  writeQuizFile(quiz);
  res.status(200).json({ quizId: quiz.id });
}
