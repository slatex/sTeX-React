import { CoverageTimeline } from '@stex-react/utils';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const filePath = process.env.COVERGAGE_TIMELINE_FILE;

  // Read the existing file data, if it exists.
  let existingData: CoverageTimeline = {};
  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath, 'utf-8');
    existingData = JSON.parse(fileData);
  }

  res.status(200).json(existingData);
}
