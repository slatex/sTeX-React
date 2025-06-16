import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfGetOrSetError, executeDontEndSet500OnError } from '../comment-utils';
import { OrganizationData } from '@stex-react/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res)) return;
  const id = req.query.id;
  const results: OrganizationData[] = await executeDontEndSet500OnError(
    `SELECT id,companyName,incorporationYear,isStartup, about, companyType,officeAddress,officePostalCode,website,domain
    FROM organizationProfile 
    WHERE id = ? 
    `,
    [id],
    res
  );
  if (!results || !results.length) {
    return res.status(200).json([]);
  }
  res.status(200).json(results[0]);
}
