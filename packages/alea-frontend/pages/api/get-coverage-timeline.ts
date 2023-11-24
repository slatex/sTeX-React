import { CoverageTimeline } from '@stex-react/utils';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';

export const CURRENT_SEM_FILE = 'current-sem.json';
export function getCoverageData(): CoverageTimeline {
  const filePath = process.env.RECORDED_SYLLABUS_DIR + '/' + CURRENT_SEM_FILE;
  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileData);
  }
  return {};
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(getCoverageData());
}
