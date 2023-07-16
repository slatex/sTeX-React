import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserIdOrSetError } from './comment-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = await getUserIdOrSetError(req, res);
  const filePath = process.env.INTERVIEW_RESPONSE_FILE;
  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath, 'utf-8');

    const records: any[] = JSON.parse(fileData);

    for (const record of records) {
      if (record.user_id === userId) {
        res.status(200).json(record);
        return;
      }
    }
  }
  return res.status(204).end();
}
