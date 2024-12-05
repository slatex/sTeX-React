import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfGetOrSetError, executeDontEndSet500OnError } from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res)) return;
  const organization = req.query.organizationName;
  const result = await executeDontEndSet500OnError(
    `SELECT id
    FROM organizationprofile 
    WHERE companyName = ? 
    `,
    [organization],
    res
  );
  if (!result) return;
  const id = result[0]?.id;
  res.status(200).json(id);
}
