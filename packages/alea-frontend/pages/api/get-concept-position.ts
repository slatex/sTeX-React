import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfPostOrSetError } from './comment-utils';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  

  const basePath =
    process.env.BASE_POSITION_PATH ||
    path.join(process.cwd(), 'packages/alea-frontend/position-data');

  console.log(' Checking base path:', basePath);

  if (!fs.existsSync(basePath)) {
    console.error(' ERROR: Base directory not found:', basePath);
    return res.status(500).json({ error: 'Base directory not found', path: basePath });
  }

  if (req.method === 'GET') {
    const { folder, file } = req.query;

    if (folder && file) {
      const filePath = path.join(basePath, folder as string, file as string);
      console.log('Fetching file:', filePath);

      if (!fs.existsSync(filePath)) {
        console.error('ERROR: File not found:', filePath);
        return res.status(404).json({ error: 'File not found', path: filePath });
      }

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return res.status(200).json({ content: fileContent });
    }

    console.log(' Fetching folders from:', basePath);
    const folders = fs
      .readdirSync(basePath)
      .filter((folder) => fs.statSync(path.join(basePath, folder)).isDirectory());

    return res.status(200).json({ folders });
  }

  if (!checkIfPostOrSetError(req, res)) return;
  
  const { folderName } = req.body;
  if (!folderName) return res.status(400).json({ error: 'Folder name is required' });

  const folderPath = path.join(basePath, folderName);
  console.log('Fetching files from folder:', folderPath);

  if (!fs.existsSync(folderPath)) {
    console.error('ERROR: Folder not found:', folderPath);
    return res.status(404).json({ error: 'Folder not found', path: folderPath });
  }

  const files = fs
    .readdirSync(folderPath)
    .filter((file) => fs.statSync(path.join(folderPath, file)).isFile());

  return res.status(200).json({ files });
}


