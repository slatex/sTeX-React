import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfPostOrSetError } from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const { concepts, limit, types, exclude, headers } = req.body;
  if (!concepts || !Array.isArray(concepts)) return;

  const response = await axios.post(
    'https://lms.voll-ki.fau.de/guided-tours/learning-objects',
    {
      concepts,
      limit,
      types,
      exclude,
    },
    { headers }
  );
  return res.status(200).json(response.data);
}
