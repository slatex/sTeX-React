import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfPostOrSetError } from './comment-utils';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;

  const positionData = req.body;
  const filePath = path.join(process.cwd(), 'position-data.json');
  try {
    let existingData = [];
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      existingData = JSON.parse(fileContent);
    }
    existingData.push(positionData);
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
    res.status(200).json({ data: positionData });
  } catch (error) {
    console.error('Error writing to JSON file:', error);
    res.status(500).json({ error: 'Failed to store data' });
  }
}
