import {
  executeQuerySet500OnError,
  getUserIdOrSetError,
} from './comment-utils';

export default async function handler(req, res) {
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;
  const comments = await executeQuerySet500OnError(
    `SELECT * FROM comments WHERE userId = ?`,
    [userId],
    res
  );
  const history = await executeQuerySet500OnError(
    `SELECT * FROM updateHistory WHERE ownerId = ?`,
    [userId],
    res
  );
  res.status(200).json({ comments, history });
}
