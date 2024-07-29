import { isModerator } from '@stex-react/api';
import { NextApiRequest, NextApiResponse } from 'next';
import { getAllQuizzes } from '@stex-react/node-utils';
import { getUserIdOrSetError } from '../comment-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = await getUserIdOrSetError(req, res);
  if (!isModerator(userId)) {
    res.status(403).send({ message: 'Unauthorized.' });
    return;
  }

  res.status(200).json(getAllQuizzes());
}
