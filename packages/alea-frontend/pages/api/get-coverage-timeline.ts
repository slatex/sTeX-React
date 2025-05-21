import { CoverageTimeline } from '@stex-react/utils';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';

export const CURRENT_SEM_FILE = 'current-sem.json';
export function getCoverageData(
  filePaths: string[] = [`${process.env.RECORDED_SYLLABUS_DIR + '/' + CURRENT_SEM_FILE}`]
): CoverageTimeline {
  const combinedData: CoverageTimeline = {};
  for (const filePath of filePaths) {
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf-8');
      const parsed: CoverageTimeline = JSON.parse(fileData);
      for (const [courseId, entries] of Object.entries(parsed)) {
        if (!combinedData[courseId]) {
          combinedData[courseId] = [];
        }
        combinedData[courseId].push(...entries);
      }
    }
  }
  return combinedData;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(getCoverageData());
}
