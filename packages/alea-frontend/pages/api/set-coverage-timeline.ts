import { canAccessResource, isModerator } from '@stex-react/api';
import { Action, CoverageSnap, CoverageTimeline, CURRENT_TERM, ResourceName } from '@stex-react/utils';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfPostOrSetError, getUserIdOrSetError } from './comment-utils';
import { CURRENT_SEM_FILE } from './get-coverage-timeline';

function backupFileName() {
  return (
    process.env.RECORDED_SYLLABUS_DIR +
    '/backups/' +
    CURRENT_SEM_FILE +
    `_bkp_${Date.now()}.json`
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!checkIfPostOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);

  const snaps = req.body.snaps as CoverageSnap[];
  const courseId = req.body.courseId as string;
  const filePath = process.env.RECORDED_SYLLABUS_DIR + '/' + CURRENT_SEM_FILE;

  if(! await canAccessResource(ResourceName.NOTES, Action.MUTATE, {
    courseId : courseId,
    instanceId : CURRENT_TERM
  })){
      res
      .status(403)
      .send({ message: 'You are not allowed to do this operation.' });
    return;
  }

  // Read the existing file data, if it exists
  let existingData: CoverageTimeline = {};
  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath, 'utf-8');
    existingData = JSON.parse(fileData);
  }

  // Create a backup
  fs.writeFileSync(
    backupFileName(),
    JSON.stringify(existingData, null, 2)
  );

  // Append the new object to the existing data.
  existingData[courseId] = snaps;

  // Write the updated data back to the file
  fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

  res.status(200).json({ message: 'snaps updated successfully!' });
}
