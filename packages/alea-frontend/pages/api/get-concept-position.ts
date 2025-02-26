import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfPostOrSetError } from './comment-utils';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { deviceId, recordingId } = req.query;
  const basePath =
    process.env.BASE_POSITION_PATH ||
    path.join(process.cwd(), 'packages/alea-frontend/position-data');
  try {
    if (!fs.existsSync(basePath)) {
      console.error(' ERROR: Base directory not found:', basePath);
      return;
    }

    if (!deviceId) {
      const devices = fs
        .readdirSync(basePath, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);
      return res.status(200).json(devices);
    }
    const devicePath = path.join(basePath, deviceId as string);
    if (!recordingId) {
      const recordingIds = fs
        .readdirSync(devicePath)
        .filter((recording) => fs.statSync(path.join(devicePath, recording)).isFile())
        .map((recording) => recording.replace(/\.[^/.]+$/, ''));
      return res.status(200).json(recordingIds);
    }
    const recordingPath = path.join(devicePath, `${recordingId}.json`);
    const content = fs.readFileSync(recordingPath, 'utf-8');

    return res.status(200).json(content);
  } catch (error) {
    return res.status(500).json({ error: 'Error processing request' });
  }
}
