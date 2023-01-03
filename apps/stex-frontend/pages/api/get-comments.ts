import { Comment } from '@stex-react/api';
import { FileLocation } from '@stex-react/utils';
import { executeAndEndSet500OnError, getUserId } from './comment-utils';

export function processResults(results: any[]) {
  for (const c of results) {
    c.isPrivate = !!c.isPrivate;
    c.isAnonymous = !!c.isAnonymous;
    c.isDeleted = !!c.isDeleted;
    c.isEdited = !!c.isEdited;
    c.postedTimestampSec = Date.parse(c['postedTimestamp']) / 1000;
    c.updatedTimestampSec = Date.parse(c['updatedTimestamp']) / 1000;
    delete c['postedTimestamp'];
    delete c['updatedTimestamp'];
  }
}

export interface GetCommentsRequest {
  files: FileLocation[];
}

export default async function handler(req, res) {
  const { files } = req.body as GetCommentsRequest;
  if (!files?.length) {
    res.status(200).json([]);
    return;
  }
  if (files.some(({ archive, filepath }) => !archive || !filepath)) {
    res.status(400).json({ error: 'Invalid input' });
    return;
  }

  const userId = (await getUserId(req)) || '';
  const fileConstraint = Array(files.length)
    .fill('(archive = ? AND filepath = ?)')
    .join(' OR ');
    
  const query = `SELECT * FROM comments WHERE (isPrivate != 1 OR userId = ? ) AND ( ${fileConstraint} )`;
  const queryValues = [userId];
  files.forEach(({ archive, filepath }) =>
  queryValues.push(archive, filepath)
  );

  const results = await executeAndEndSet500OnError(query, queryValues, res);
  if (!results) return;
  processResults(results as Comment[]);
  res.status(200).json(results);
}
