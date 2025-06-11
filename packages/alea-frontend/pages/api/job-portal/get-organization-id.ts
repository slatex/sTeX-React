import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfGetOrSetError, executeDontEndSet500OnError } from '../comment-utils';

export async function getOrganizationId(organizationName: string, res: NextApiResponse) {
  if (!organizationName) return;
  const result: any = await executeDontEndSet500OnError(
    `SELECT id
    FROM organizationProfile 
    WHERE companyName = ?`,
    [organizationName],
    res
  );
  if (!result || !result.length) return [];
  return result[0]?.id;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res)) return;
  const organizationName = req.query.organizationName;
  const id = await getOrganizationId(organizationName as string, res);
  res.status(200).json(id);
}
