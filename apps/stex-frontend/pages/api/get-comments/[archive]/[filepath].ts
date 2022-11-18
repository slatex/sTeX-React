import { Comment } from '@stex-react/api';
import { executeQuerySet500OnError, getUserId } from '../../comment-utils';

export default async function handler(req, res) {
  const { archive: archiveEncoded, filepath: filepathEncoded } = req.query;
  const archive = decodeURIComponent(archiveEncoded);
  const filepath = decodeURIComponent(filepathEncoded);
  const userId = (await getUserId(req)) || '';
  const results: Comment[] = await executeQuerySet500OnError(
    `SELECT * FROM comments WHERE archive = ? AND filepath = ?
      AND (hiddenStatus IS NULL OR hiddenStatus = 'UNHIDDEN')
      AND (isDeleted IS NULL OR isDeleted = 0)
      AND (isPrivate != 1 OR userId = ? )`,
    [archive, filepath, userId],
    res
  );
  if (!results) return;
  for (const c of results) {
    c.postedTimestampSec = Date.parse(c['postedTimestamp']) / 1000;
    c.updatedTimestampSec = Date.parse(c['updatedTimestamp']) / 1000;
    delete c['postedTimestamp'];
    delete c['updatedTimestamp'];
  }

  res.status(200).json(results);
}
