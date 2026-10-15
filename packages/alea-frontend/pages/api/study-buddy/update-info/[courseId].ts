import { StudyBuddy } from '@alea/spec';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfPostOrSetError,
  executeAndEndSet500OnError,
  getUserInfo,
} from '../../comment-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!checkIfPostOrSetError(req, res)) return;
  const user = await getUserInfo(req);
  const userId = user?.userId;
  if (!userId) return res.status(403).send('User info not available');

  const courseId = req.query.courseId as string;
  const instanceId = req.query.instanceId as string;
  const institutionId = req.query.institutionId as string;

  if (!institutionId || !courseId || !instanceId) {
    res.status(422).end('Missing required field: institutionId or courseId or instanceId');
    return;
  }

  const {
    intro,
    studyProgram,
    email,
    semester,
    meetType,
    languages,
    dayPreference,
  } = req.body as StudyBuddy;

  const active = true;
  const sbCourseId = `${courseId}||${instanceId}`;

  let results = undefined;

  results = await executeAndEndSet500OnError(
    'REPLACE INTO StudyBuddyUsers (userName, intro, studyProgram, email, semester, meetType, languages, dayPreference, active, userId, sbCourseId, courseId, instanceId, institutionId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      user.fullName,
      intro,
      studyProgram,
      email,
      semester,
      meetType,
      languages,
      dayPreference,
      active,
      userId,
      sbCourseId,
      courseId,
      instanceId,
      institutionId,
    ],
    res
  );

  if (!results) return;
  res.status(204).end();
}
