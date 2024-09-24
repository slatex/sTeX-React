import { ResourceActionPair } from '@stex-react/utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const resourceActions: ResourceActionPair[] = req.body.resourceActionPairs;

  if (!resourceActions || !Array.isArray(resourceActions)) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  try {
    const placeholders = resourceActions.map(() => '(?, ?)').join(', ');
    const queryParams = resourceActions.flatMap(({ resourceId, actionId }) => [
      resourceId,
      actionId,
    ]);
    const query = `
      SELECT resourceId, actionId, aclId
      FROM ResourceAccess
      WHERE (resourceId, actionId) IN (${placeholders})
    `;
    const results = await executeQuery(query, queryParams);
    const aclIds = {};
    if (Array.isArray(results)) {
      results.forEach(({ resourceId, aclId }) => {
        aclIds[resourceId] = aclId;
      });
    }
    return res.status(200).json({ aclIds });
  } catch (error) {
    console.error('Error fetching ACL data:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
