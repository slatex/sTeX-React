import { CoverageTimeline } from '@stex-react/utils';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';

export function getCoverageData(): CoverageTimeline {
  const filePath = process.env.COVERGAGE_TIMELINE_FILE;
  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileData);
  }
  return {};
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(getCoverageData());
}
