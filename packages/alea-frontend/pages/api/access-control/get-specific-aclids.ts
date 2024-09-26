import { ResourceActionPair } from '@stex-react/utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { executeAndEndSet500OnError } from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const resourceActions: ResourceActionPair[] = req.body.resourceActionPairs;

  if (!resourceActions?.length) return res.status(400).send('Invalid Input');
  
  const placeholders = resourceActions.map(() => '(?, ?)').join(', ');
  const queryParams = resourceActions.flatMap(({ resourceId, actionId }) => [resourceId, actionId]);
  const query = `
      SELECT resourceId, actionId, aclId
      FROM ResourceAccess
      WHERE (resourceId, actionId) IN (${placeholders})
    `;
  const results = await executeAndEndSet500OnError(query, queryParams, res);
  const aclIds = {};
  if (!results) return;
  results.forEach(({ resourceId, aclId }) => {
    aclIds[resourceId] = aclId;
  });
  return res.status(200).send(aclIds);
}
