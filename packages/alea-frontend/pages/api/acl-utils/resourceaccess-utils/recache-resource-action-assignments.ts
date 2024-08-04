import { NextApiRequest, NextApiResponse } from 'next';
import { initializeResourceCache, RESOURCE_CACHE } from './resource-store';
import { checkIfPostOrSetError } from '../../comment-utils';
export async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  initializeResourceCache();
  return;
}
