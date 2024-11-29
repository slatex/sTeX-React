import { NextApiRequest, NextApiResponse } from 'next';
import { CACHE_STORE } from '../acl-utils/cache-store';
import { ACLMembership, Flattening } from '../acl-utils/flattening';
import { executeAndEndSet500OnError } from '../comment-utils';
import { initializeResourceCache } from '../acl-utils/resourceaccess-utils/resource-store';

export async function recomputeMembership(): Promise<void> {
  const aclMemberships = await executeAndEndSet500OnError<ACLMembership[]>(
    'SELECT * FROM ACLMembership',
    [],
    null
  );
  const flattening = new Flattening(aclMemberships, CACHE_STORE);
  const acls = await executeAndEndSet500OnError<{ id: string }[]>(
    `SELECT id FROM AccessControlList`,
    [],
    null
  );
  for (const acl of acls) {
    await flattening.cacheAndGetFlattenedMembers(acl.id);
  }
  await initializeResourceCache();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await recomputeMembership();
    res.status(200).end();
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
