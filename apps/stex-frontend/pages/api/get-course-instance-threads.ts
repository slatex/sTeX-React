import { Comment } from '@stex-react/api';
import { executeAndEndSet500OnError } from './comment-utils';
import { processResults } from './get-comments';

export interface CourseInstance {
  courseId: string;
  courseTerm: string;
}

export default async function handler(req, res) {
  const instance = req.body as CourseInstance;
  if (!instance?.courseId || !instance?.courseTerm) {
    return res
      .status(400)
      .json({
        error: `Invalid input: [${instance.courseId}] [${instance.courseTerm}]`,
      });
  }
  const query = `SELECT * FROM comments WHERE (isPrivate != 1 AND isDeleted != 1) AND courseId = ? AND courseTerm = ? AND commentId = threadId ORDER BY postedTimestamp DESC`;

  const results = await executeAndEndSet500OnError(
    query,
    [instance.courseId, instance.courseTerm],
    res
  );
  if (!results) return;
  processResults(results as Comment[]);
  res.status(200).json(results);
}
