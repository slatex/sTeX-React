import { Quiz, isModerator } from '@stex-react/api';
import { Action, quizResourceId } from '@stex-react/utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { checkIfPostOrSetError } from '../comment-utils';
import { doesQuizExist, writeQuizFile } from '@stex-react/node-utils';
import { getUserIdIfAuthorizedOrSetError } from '../access-control/resource-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!checkIfPostOrSetError(req, res)) return;
  // const userId = await getUserIdOrSetError(req, res);
  // if (!isModerator(userId)) {
  //   res.status(403).send({ message: 'Unauthorized.' });
  //   return;
  // }
  const {
    courseId,
    courseTerm,
    quizStartTs,
    quizEndTs,
    feedbackReleaseTs,
    manuallySetPhase,
    title,
    problems,
  } = req.body as Quiz;

  const userId = await getUserIdIfAuthorizedOrSetError(req, res, quizResourceId(courseId, courseTerm), Action.CREATE);
  if(!userId) return res.status(403).send({ message: 'unauthorized' });
  
  const quiz = {
    id: 'quiz-' + uuidv4().substring(0, 8),
    version: 0,

    courseId,
    courseTerm,
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
