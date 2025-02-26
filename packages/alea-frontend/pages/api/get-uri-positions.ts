import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfPostOrSetError } from './comment-utils';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;

  const positionData = req.body;
  const deviceId = positionData.deviceId;
  const recordingId = positionData.recordingId;
  if (!deviceId) return;
  const directoryPath = path.join(process.cwd(), 'position-data', deviceId);
  const fileName = `${recordingId}.json`;
  const filePath = path.join(directoryPath, fileName);

  try {
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }
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
