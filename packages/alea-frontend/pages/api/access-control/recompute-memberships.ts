import { NextApiRequest, NextApiResponse } from 'next';
import { CACHE_STORE } from '../acl-utils/cache-store';
import { ACLMembership, Flattening } from '../acl-utils/flattening';
import { initializeResourceCache } from '../acl-utils/resourceaccess-utils/resource-store';
import { executeQueryAndEnd } from '../comment-utils';

export async function recomputeMemberships(): Promise<boolean> {
  const aclMemberships = await executeQueryAndEnd<ACLMembership[]>(
    'SELECT * FROM ACLMembership',
    []
  );
  if (!aclMemberships || !Array.isArray(aclMemberships)) return false;
  const flattening = new Flattening(aclMemberships, CACHE_STORE);

  const acls = await executeQueryAndEnd<{ id: string }[]>(`SELECT id FROM AccessControlList`, []);
  if (!acls || !Array.isArray(acls)) return false;
  for (const acl of acls) {
    await flattening.cacheAndGetFlattenedMembers(acl.id);
  }

  await initializeResourceCache();
  return true;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const success = await recomputeMemberships();
  if (success) res.status(200).end();
  else return res.status(500).send('Failed to recompute memberships');
}
