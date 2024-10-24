import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfPostOrSetError } from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const { target, headers } = req.body;
  if (!target) return;
  const response = await axios.post(
    'https://lms.voll-ki.fau.de/guided-tours/leaf-concepts  ',
    { target },
    { headers }
  );
  const leafConcepts = response.data['leaf-concepts'];
  if (!leafConcepts) return;
  return res.status(200).json({ leafConcepts });
}
