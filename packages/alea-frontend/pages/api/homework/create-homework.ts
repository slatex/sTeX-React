import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfPostOrSetError, executeAndEndSet500OnError } from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const {
    homeworkName,
    homeworkGivenDate,
    answerReleaseDate,
    courseId,
    courseInstance,
    archive,
    filepath,
  } = req.body;

  const result = await executeAndEndSet500OnError(
    'INSERT INTO homework (homeworkName, homeworkGivenDate,answerReleaseDate, courseId, courseInstance, archive, filepath) VALUES (?, ?, ?,?, ?, ?, ?)',
    [
      homeworkName,
      homeworkGivenDate,
      answerReleaseDate,
      courseId,
      courseInstance,
      archive,
      filepath,
    ],
    res
  );
  if (!result) return;
  res.status(200).json({ result, message: 'Homework added successfully!' });
}
