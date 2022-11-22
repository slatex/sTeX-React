import { Comment } from '@stex-react/api';
import { executeQuerySet500OnError } from './comment-utils';

export default async function handler(req, res) {
  const { archive: archiveEncoded, filepath: filepathEncoded } = req.query;
  const archive = decodeURIComponent(archiveEncoded);
  const filepath = decodeURIComponent(filepathEncoded);
  const results: Comment[] = await executeQuerySet500OnError(
    `SELECT archive, filepath, MAX(updatedtimestamp) AS updatedTimestamp
    FROM comments
    WHERE isPrivate !=1
    GROUP BY archive, filepath
    ORDER BY updatedTimestamp DESC`,
    [archive, filepath],
    res
  );
  if (!results) return;
  for (const c of results) {
    c.updatedTimestampSec = Date.parse(c['updatedTimestamp']) / 1000;
    delete c['postedTimestamp'];
  }

  res.status(200).json(results);
}
