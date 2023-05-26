import { Comment } from '@stex-react/api';
import { executeAndEndSet500OnError } from '../comment-utils';
import { processResults } from '../get-comments';

export default async function handler(req, res) {
  const { threadId } = req.query;
  const threadIdNum = +threadId;
  if (!threadIdNum) {
    return res.status(400).json({
      error: `Invalid input: [${threadId}]`,
    });
  }
  const query = `SELECT * FROM comments WHERE (isPrivate != 1 AND isDeleted != 1) AND threadId = ?`;

  const results = await executeAndEndSet500OnError(query, [threadId], res);
  if (!results) return;
  processResults(results as Comment[]);
  res.status(200).json(results);
}
