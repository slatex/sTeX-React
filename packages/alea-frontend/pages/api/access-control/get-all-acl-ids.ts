import { NextApiRequest, NextApiResponse } from 'next';
import { executeAndEndSet500OnError } from '../comment-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const result: any[] = await executeAndEndSet500OnError(
    'select id from AccessControlList',
    [],
    res
  );
  res.status(200).send(result?.map((r) => r.id) ?? []);
}
