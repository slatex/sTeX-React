import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfGetOrSetError, executeAndEndSet500OnError } from '../comment-utils';
import { CURRENT_TERM } from '@stex-react/utils';
import { getHomeworkOrSetError } from './get-homework';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res)) return;
  const courseId = req.query.courseId as string;
  const homeworkId = Number(req.query.homeworkId);
  if (!courseId) return res.status(422).send('Missing params.');
  const instanceId = (req.query.courseInstance as string) ?? CURRENT_TERM;
  const homework = await getHomeworkOrSetError(homeworkId, true, res);
  homework.problems = JSON.parse(homework.problems.toString());
  const totolAnswer = await executeAndEndSet500OnError(
    `SELECT SUM(answer_count) AS total_answers From (SELECT count( DISTINCT userId) as answer_count FROM Answer WHERE questionId in (?) GROUP BY userId) AS user_answers`,
    [Object.keys(homework.problems)],
    res
  );
  res.send(totolAnswer);
}
