import { Comment } from '@stex-react/api';
import { executeAndEndSet500OnError, getUserId } from '../../comment-utils';

export function processResults(results: any[]) {
  for (const c of results) {
    c.postedTimestampSec = Date.parse(c['postedTimestamp']) / 1000;
    c.updatedTimestampSec = Date.parse(c['updatedTimestamp']) / 1000;
    delete c['postedTimestamp'];
    delete c['updatedTimestamp'];
  }
}

export default async function handler(req, res) {
  const { archive: archiveEncoded, filepath: filepathEncoded } = req.query;
  const archive = decodeURIComponent(archiveEncoded);
  const filepath = decodeURIComponent(filepathEncoded);
  const userId = (await getUserId(req)) || '';
  const results: Comment[] = await executeAndEndSet500OnError(
    `SELECT * FROM comments WHERE archive = ? AND filepath = ?
      AND (isPrivate != 1 OR userId = ? )`,
    [archive, filepath, userId],
    res
  );
  if (!results) return;
  processResults(results);
  res.status(200).json(results);
}
