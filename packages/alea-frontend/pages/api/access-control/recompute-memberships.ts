import { NextApiRequest, NextApiResponse } from 'next';
import { CACHE_STORE } from '../acl-utils/cache-store';
import { ACLMembership, Flattening } from '../acl-utils/flattening';
import { checkIfPostOrSetError, executeAndEndSet500OnError } from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const aclMemberships = await executeAndEndSet500OnError<ACLMembership[]>(
    'SELECT * FROM ACLMembership',
    [],
    res
  );
  const flattening = new Flattening(aclMemberships, CACHE_STORE);
  const result = await executeAndEndSet500OnError<{ id: string }[]>(
    `SELECT id FROM AccessControlList`,
    [],
    res
  );
  for (const element of result) {
    await flattening.findMembers(element.id);
    await flattening.findACL(element.id);
  }
  res.status(200).end();
}
