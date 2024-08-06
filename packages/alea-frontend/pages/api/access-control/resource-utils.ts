import { NextApiRequest, NextApiResponse } from 'next';
import { isMemberOfAcl } from '../acl-utils/acl-common-utils';
import { getUserIdOrSetError } from '../comment-utils';
import { Action, getResourceId, isValidAction, ResourceName } from '@stex-react/utils';
import { returnAclIdForResourceIdAndActionId } from '../acl-utils/resourceaccess-utils/resource-common-utils';

export interface ResourceActionParams {
  name: ResourceName;
  action: Action;
  variables?: Record<string, string>;
}

export async function getUserIdIfAnyAuthorizedOrSetError(
  req: NextApiRequest,
  res: NextApiResponse,
  resourceActions: ResourceActionParams[]
) {
  const userId: string | undefined = await getUserIdOrSetError(req, res);
  if (!userId) return undefined;

  for (const resourceAction of resourceActions) {
    const resourceId = getResourceId(resourceAction.name, resourceAction.variables);

    if (!isValidAction(resourceAction.action, resourceAction.name)) {
      throw new Error(
        `Action ${resourceAction.action} is not valid for resource ${resourceAction.name}`
      );
    }

    const aclId = await returnAclIdForResourceIdAndActionId(resourceId, resourceAction.action);
    if (typeof aclId === 'object' && 'error' in aclId) {
      continue;
    }
    if (aclId && (await isMemberOfAcl(aclId, userId as string))) return userId;
  }
  return res.status(403).send('unauthorized');
}

export async function getUserIdIfAuthorizedOrSetError(
  req: NextApiRequest,
  res: NextApiResponse,
  resourceName: ResourceName,
  actionId: Action,
  variables?: Record<string, string>
) {
  return await getUserIdIfAnyAuthorizedOrSetError(req, res, [
    { name: resourceName, action: actionId, variables },
  ]);
}
