import mysql from 'serverless-mysql';

const db = mysql({
  config: {
    host: process.env.MYSQL_HOST,
    port: +process.env.MYSQL_PORT,
    database: process.env.MYSQL_MATOMO_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
  },
});

export async function queryMatomoDb<T>(query: string, values: any[]) {
  try {
    const results = await db.query<T>(query, values);
    return results;
  } catch (error) {
    return { error };
  }
}

export async function queryMatomoDbAndEnd<T>(query: string, values: any[]) {
  try {
    const results = await db.query<T>(query, values);
    await db.end();
    return results;
  } catch (error) {
    return { error };
  }
}

export async function queryMatomoDbAndEndSet500OnError<T>(
  query: string,
  values: any[],
  res
): Promise<T> {
  const results = await queryMatomoDbAndEnd<T>(query, values);
  if (results['error']) {
    res.status(500).send(results);
    return undefined;
  }
  return results as T;
}

export async function queryMatomoDbDontEndSet500OnError<T>(
  query: string,
  values: any[],
  res
): Promise<T> {
  const results = await queryMatomoDb<T>(query, values);
  if (results['error']) {
    res.status(500).send(results);
    return undefined;
  }
  return results as T;
}
