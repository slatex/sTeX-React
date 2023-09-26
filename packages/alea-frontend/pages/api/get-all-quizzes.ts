import { Quiz, isModerator } from '@stex-react/api';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserIdOrSetError } from './comment-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = await getUserIdOrSetError(req, res);
  if (!isModerator(userId)) {
    res.status(403).send({ message: 'Unauthorized.' });
    return;
  }

  const quizFiles = fs.readdirSync(process.env.QUIZ_INFO_DIR);
  const quizzes = quizFiles
    .map((file) => {
      if (!(file.startsWith('quiz-') && file.endsWith('.json'))) return;
      console.log(file);
      const quiz = JSON.parse(
        fs.readFileSync(process.env.QUIZ_INFO_DIR + '/' + file, 'utf-8')
      ) as Quiz;
      return quiz;
    })
    .filter(Boolean);
  res.status(200).json(quizzes);
}
