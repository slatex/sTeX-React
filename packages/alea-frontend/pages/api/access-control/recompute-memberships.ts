import { NextApiRequest, NextApiResponse } from 'next';
import { CACHE_STORE } from '../acl-utils/cache-store';
import { ACLMembership, Flattening } from '../acl-utils/flattening';
import { checkIfPostOrSetError, executeAndEndSet500OnError } from '../comment-utils';
import { initializeResourceCache } from '../acl-utils/resourceaccess-utils/resource-store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const aclMemberships = await executeAndEndSet500OnError<ACLMembership[]>(
    'SELECT * FROM ACLMembership',
    [],
    res
  );
  const flattening = new Flattening(aclMemberships, CACHE_STORE);
  const acls = await executeAndEndSet500OnError<{ id: string }[]>(
    `SELECT id FROM AccessControlList`,
    [],
    res
  );
  for (const acl of acls) {
    await flattening.cacheAndGetFlattenedMembers(acl.id);
  }
  await initializeResourceCache();
  res.status(200).end();
}
