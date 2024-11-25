import { NextApiRequest, NextApiResponse } from 'next';
import { executeDontEndSet500OnError } from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.body;
  if (!userId) return;
  let tableToCheck;
  if (userId.length === 8 && !userId.includes('@')) {
    tableToCheck = 'studentProfile';
  } else tableToCheck = 'recruiterProfile';

  const query = `
    SELECT userId
    FROM ${tableToCheck}
    WHERE userId = ?
  `;
  const results :any[]= await executeDontEndSet500OnError(query, [userId], res);
  if (!results) return;
  const exists = results && results.length > 0;

  res.status(200).json({
    exists,
  });
}
