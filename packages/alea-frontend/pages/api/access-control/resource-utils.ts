import { NextApiRequest, NextApiResponse } from 'next';
import { isMemberOfAcl } from '../acl-utils/acl-common-utils';
import { executeAndEndSet500OnError, getUserIdOrSetError } from '../comment-utils';
import { Action, getResourceId, isValidAction, ResourceName } from '@stex-react/utils';

export interface AllowResourceAction {
  name: ResourceName;
  action: Action;
  variables?: Record<string, string>;
}

export async function getUserIdIfAuthorizedOrSetError2(
  req: NextApiRequest,
  res: NextApiResponse,
  resourceActions: AllowResourceAction[]
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

    const aclQuery = `SELECT aclId FROM ResourceAccess WHERE resourceId = ? AND actionId = ?`;
    const acl: { aclId: string }[] = await executeAndEndSet500OnError(
      aclQuery,
      [resourceId, resourceAction.action],
      res
    );
    if (await isMemberOfAcl(acl[0].aclId, userId as string)) return userId;
  }
  return undefined;
}

export async function getUserIdIfAuthorizedOrSetError(
  req: NextApiRequest,
  res: NextApiResponse,
  resourceName: ResourceName,
  actionId: Action,
  variables?: Record<string, string>
) {
  return await getUserIdIfAuthorizedOrSetError2(req, res, [
    { name: resourceName, action: actionId, variables },
  ]);
}
