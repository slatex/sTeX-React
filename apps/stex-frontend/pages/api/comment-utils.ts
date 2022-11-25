import { Comment } from '@stex-react/api';
import axios from 'axios';
import mysql from 'serverless-mysql';
const db = mysql({
  config: {
    host: process.env.MYSQL_HOST,
    port: +process.env.MYSQL_PORT,
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
  },
});

export async function executeQuerySet500OnError<T>(
  query: string,
  values: any[],
  res
): Promise<T> {
  const results = await executeQuery<T>(query, values);
  if (results['error']) {
    res.status(500).send(results);
    return undefined;
  }
  return results as T;
}

export async function executeQuery<T>(query: string, values: any[]) {
  try {
    const results = await db.query<T>(query, values);
    await db.end();
    return results;
  } catch (error) {
    return { error };
  }
}

export async function executeTransaction(
  query1: string,
  values1: any[],
  query2: string,
  values2: any[]
) {
  try {
    const results = await db
      .transaction()
      .query(query1, values1)
      .query(query2, values2)
      .commit();
    await db.end();
    return results;
  } catch (error) {
    return { error };
  }
}

export async function executeTransactionSet500OnError(
  query1: string,
  values1: any[],
  query2: string,
  values2: any[],
  res
) {
  const results = await executeTransaction(query1, values1, query2, values2);
  if (results['error']) {
    res.status(500).send(results);
    return undefined;
  }
  return results;
}

export async function getUserId(req) {
  if (!req.headers.authorization) return undefined;
  const headers = { Authorization: req.headers.authorization };
  const lmsServerAddress = process.env.NEXT_PUBLIC_LMS_URL;
  const resp = await axios.get(`${lmsServerAddress}/getuserid`, { headers });
  return resp.data;
}

export async function getExistingComment(
  commentId: number
): Promise<{ existing: Comment; error?: number }> {
  const existingComments = await executeQuery(
    'SELECT * FROM comments WHERE commentId = ? AND (isDeleted IS NULL OR isDeleted !=1)',
    [commentId]
  );
  if (existingComments['error']) {
    console.error(existingComments['error']);
    return { existing: undefined, error: 500 };
  }

  if (existingComments['length'] !== 1) {
    return { existing: undefined, error: 404 };
  }
  return { existing: existingComments[0], error: undefined };
}

export async function getCommentOwner(
  commentId: number
): Promise<{ ownerId: string; error?: number }> {
  const existingComments = await executeQuery(
    'SELECT userId, isDeleted FROM comments WHERE commentId = ?',
    [commentId]
  );
  if (existingComments['error']) {
    console.log(existingComments['error']);
    return { ownerId: undefined, error: 500 };
  }

  if (existingComments['length'] !== 1 || existingComments[0]['isDeleted']) {
    return { ownerId: undefined, error: 404 };
  }
  const ownerId = existingComments[0]['userId'];
  return { ownerId, error: ownerId ? undefined : 403 };
}

export function checkIfPostOrSetError(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Only POST requests allowed' });
    return false;
  }
  return true;
}

export async function getUserIdOrSetError(req, res) {
  const userId = await getUserId(req);
  if (!userId) res.status(403).send({ message: 'Could not get userId' });
  return userId;
}
