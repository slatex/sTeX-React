import { Action, getResourceId, isValidAction, ResourceName } from '@stex-react/utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { isMemberOfAcl } from '../acl-utils/acl-common-utils';
import { returnAclIdForResourceIdAndActionId } from '../acl-utils/resourceaccess-utils/resource-common-utils';
import { executeAndEndSet500OnError, getUserIdOrSetError } from '../comment-utils';

export interface ResourceActionParams {
  name: ResourceName;
  action: Action;
  variables?: Record<string, string>;
}

export async function isUserIdAuthorizedForAny(
  userId: string,
  resourceActions: ResourceActionParams[]
) {
  console.log('User ID:', userId); // Log userId to ensure it’s being passed correctly
  console.log('Resource Actions:', resourceActions); // Log resourceActions to verify the data

  if (!userId) return false;

  for (const resourceAction of resourceActions) {
    console.log('Checking resource action:', resourceAction); // Log current resource action being checked

    const resourceId = getResourceId(resourceAction.name, resourceAction.variables);
    console.log('Resource ID:', resourceId); // Log the resource ID to verify it's being generated correctly

    if (!isValidAction(resourceAction.action, resourceAction.name)) {
      throw new Error(
        `Action ${resourceAction.action} is not valid for resource ${resourceAction.name}`
      );
    }

    const aclId = await returnAclIdForResourceIdAndActionId(resourceId, resourceAction.action);
    console.log('ACL ID:', aclId); // Log the aclId to ensure it's fetched properly

    if (aclId) {
      const isMember = await isMemberOfAcl(aclId, userId);
      console.log('Is User Member of ACL:', isMember); // Log whether the user is a member of the ACL

      if (isMember) {
        console.log('User is authorized for this resource action.');
        return true; // If authorized, return true
      }
    } else {
      console.log('No ACL found for this resource-action combination.');
    }
  }

  console.log('User is not authorized for any of the resource actions.');
  return false;
}


export async function getUserIdIfAnyAuthorizedOrSetError(
  req: NextApiRequest,
  res: NextApiResponse,
  resourceActions: ResourceActionParams[]
) {
  const userId: string | undefined = await getUserIdOrSetError(req, res);
  console.log('User ID from request:', userId); // Log the userId
  console.log('Resource Actions:', resourceActions); // Log resourceActions

  if (!userId) return undefined;
  if (await isUserIdAuthorizedForAny(userId, resourceActions)) return userId;

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

function wildCardToRegexExp(wildCardPattern: string) {
  return new RegExp(`^${wildCardPattern.replace(/\/\*\*/, '(/.*)?').replace(/\/\*/, '/[^/]+')}$`);
}

export async function canUpdateAccessControlEntries(
  res: NextApiResponse,
  resourceId: string,
  userId: string
) {
  const query = 'SELECT resourceId, aclId FROM ResourceAccess WHERE actionId = ?';
  const accessControlEntries: Array<{ resourceId: string; aclId: string }> =
    await executeAndEndSet500OnError(query, [Action.ACCESS_CONTROL], res);
  const matchingAclIds: Set<string> = new Set();
  for (const accessControlEntry of accessControlEntries) {
    const regex = wildCardToRegexExp(accessControlEntry.resourceId);
    if (regex.test(resourceId)) {
      matchingAclIds.add(accessControlEntry.aclId);
    }
  }

  for (const matchingAclId of matchingAclIds) {
    if (await isMemberOfAcl(matchingAclId, userId as string)) {
      return true;
    }
  }
  return false;
}

export async function canUserModerateComments(
  userId: string,
  courseId: string,
  courseTerm: string
) {
  const resourceActions: ResourceActionParams[] = [
    { name: ResourceName.ALL_COMMENTS, action: Action.MODERATE },
  ];
  if (courseId && courseTerm) {
    resourceActions.push({
      name: ResourceName.COURSE_COMMENTS,
      action: Action.MODERATE,
      variables: { courseId, instanceId: courseTerm },
    });
  }
  return isUserIdAuthorizedForAny(userId, resourceActions);
}

export async function getUserIdIfCanModerateCommentsOrSetError(
  req: NextApiRequest,
  res: NextApiResponse,
  c?: { courseId?: string; courseTerm?: string }
) {
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;
  if (await canUserModerateComments(userId, c.courseId, c.courseTerm)) return userId;
  res.status(403).send('unauthorized');
  return undefined;
}

export async function canUserModerateStudyBuddy(
  userId: string,
  courseId: string,
  courseTerm: string
) {
  const resourceActions: ResourceActionParams[] = [
    { name: ResourceName.ALL_STUDY_BUDDY, action: Action.MODERATE },
  ];
  if (courseId && courseTerm) {
    resourceActions.push({
      name: ResourceName.COURSE_STUDY_BUDDY,
      action: Action.MODERATE,
      variables: { courseId: courseId, instanceId: courseTerm },
    });
  }
  return isUserIdAuthorizedForAny(userId, resourceActions);
}

export async function getUserIdIfCanModerateStudyBuddyOrSetError(
  req: NextApiRequest,
  res: NextApiResponse,
  courseId?: string,
  instanceId?: string
) {
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;
  if (await canUserModerateStudyBuddy(userId, courseId, instanceId)) return userId;
  res.status(403).send('unauthorized');
  return undefined;
}
