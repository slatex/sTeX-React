import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfPostOrSetError, getUserIdOrSetError } from './comment-utils';
import { getCourseInfo } from '@stex-react/api';
import {
  Action,
  COURSE_SPECIFIC_RESOURCENAMES,
  CURRENT_TERM,
  ALL_RESOURCE_TYPES,
  ResourceName,
  CourseResourceAction,
} from '@stex-react/utils';
import { isUserIdAuthorizedForAny } from './access-control/resource-utils';

function getValidActionsForResource(resourceName: ResourceName): Action[] {
  const resource = ALL_RESOURCE_TYPES.find((resource) => resource.name === resourceName);
  if (!resource) {
    throw new Error(`Resource ${resourceName} not found`);
  }
  return resource.possibleActions;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;

  const courseIds = Object.keys(await getCourseInfo(req.body.mmtUrl));
  const resourceNames = COURSE_SPECIFIC_RESOURCENAMES;

  const resourceActions: CourseResourceAction[] = courseIds.flatMap((courseId) =>
    resourceNames.flatMap((name) => {
      const validActions = getValidActionsForResource(name);
      return validActions.map((action) => ({
        courseId,
        name,
        action,
      }));
    })
  );

  const authorizedResourceActions = (
    await Promise.all(
      resourceActions.map(async (resourceAction) => {
        const isAuthorized = await isUserIdAuthorizedForAny(userId, [
          {
            name: resourceAction.name,
            action: resourceAction.action,
            variables: { courseId: resourceAction.courseId, instanceId: CURRENT_TERM },
          },
        ]);
        return isAuthorized ? resourceAction : null;
      })
    )
  ).filter((res) => res !== null);

  return res.status(200).json(authorizedResourceActions);
}
