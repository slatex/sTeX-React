import { StudyBuddy } from '@stex-react/api';
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
  const userId = user?.['user_id'];
  if (!userId) {
    res.status(403).send({ message: 'User info not available' });
  }
  console.log('dsdsdsdsdsd');

  const userName = user['given_name'] ?? '' + ' ' + user['sn'] ?? '';
  const courseId = req.query.courseId as string;

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

  let results = undefined;

  results = await executeAndEndSet500OnError(
    'REPLACE INTO StudyBuddyUsers (userName, intro, studyProgram, email, semester, meetType, languages, dayPreference, active, userId, courseId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      userName,
      intro,
      studyProgram,
      email,
      semester,
      meetType,
      languages,
      dayPreference,
      active,
      userId,
      courseId,
    ],
    res
  );

  if (!results) return;
  res.status(204).end();
}
