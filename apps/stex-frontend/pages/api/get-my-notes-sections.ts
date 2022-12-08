import { executeAndEndSet500OnError, getUserIdOrSetError } from './comment-utils';

export default async function handler(req, res) {
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;

  const results: any[] = await executeAndEndSet500OnError(
    `SELECT archive, filepath, MAX(updatedtimestamp) AS updatedTimestamp
    FROM comments
    WHERE isPrivate = 1 AND userId = ?
    GROUP BY archive, filepath
    ORDER BY updatedTimestamp DESC`,
    [userId],
    res
  );
  if (!results) return;
  for (const c of results) {
    c.updatedTimestampSec = Date.parse(c['updatedTimestamp']) / 1000;
    delete c['updatedTimestamp'];
  }

  res.status(200).json(results);
}
