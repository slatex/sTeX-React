import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfGetOrSetError, executeDontEndSet500OnError } from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res)) return;
  const organization = req.query.organizationName;
  const result: any = await executeDontEndSet500OnError(
    `SELECT id
    FROM organizationprofile 
    WHERE companyName = ? 
    `,
    [organization],
    res
  );
  if (!result || !result.length) {
    return res.status(200).json([]);
  }
  const id = result[0]?.id;
  res.status(200).json(id);
}
