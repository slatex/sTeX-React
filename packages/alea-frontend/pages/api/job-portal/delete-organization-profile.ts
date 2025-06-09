import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfPostOrSetError,
  executeAndEndSet500OnError,
  executeDontEndSet500OnError,
} from '../comment-utils';
import { OrganizationData } from '@stex-react/api';
async function getOrganizationProfileById(id: string, res: NextApiResponse) {
  const results: OrganizationData[] = await executeDontEndSet500OnError(
    `SELECT id,companyName,incorporationYear,isStartup, about, companyType,officeAddress,officePostalCode,website,domain
      FROM organizationProfile 
      WHERE id = ? 
      `,
    [id],
    res
  );
  return results;
}
//risky , donot use unless necessary.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const { id } = req.body;
  if (!id) return res.status(400).send('Organization id is missing');
  const recruiter = await getOrganizationProfileById(id, res);
  if (!recruiter) return;
  const result = await executeAndEndSet500OnError(
    'DELETE FROM organizationProfile WHERE id = ?',
    [id],
    res
  );
  if (!result) return;
  res.status(200).end();
}
