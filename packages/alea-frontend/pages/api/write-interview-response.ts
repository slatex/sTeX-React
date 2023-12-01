import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserInfo } from './comment-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userInfo = await getUserInfo(req);
  const response = req.body?.response;

  if (!response) {
     res.status(400).json({ message: 'Response missing.' });
     return;
  }
  let toStore = undefined;
  if (userInfo) {
    toStore = { response, ...userInfo };
  } else {
    const { userName, userEmail } = req.body;
    if (!userName || !userEmail) {
      res.status(400).json({ message: 'Invalid user name/email' });
      return;
    }
    toStore = { response, userName, userEmail };    
  }

  // File path to append the response
  const filePath = process.env.INTERVIEW_RESPONSE_FILE;

  // Read the existing file data, if it exists
  let existingData: any[] = [];
  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath, 'utf-8');
    existingData = JSON.parse(fileData);
  }

  // Create a backup
  /*fs.writeFileSync(
    filePath + `_bkp_${Date.now()}`,
    JSON.stringify(existingData, null, 2)
  );*/

  // Append the new object to the existing data.
  existingData.push(toStore);

  // Write the updated data back to the file
  fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

  res.status(200).json({ message: 'response recorded!' });
}
