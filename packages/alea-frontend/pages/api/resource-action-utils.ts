import { NextApiRequest, NextApiResponse } from "next";
import { executeAndEndSet500OnError, getUserIdOrSetError } from "./comment-utils";
import { isMemberOfAcl } from "./acl-utils/acl-common-utils";

export enum Action {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}

export async function getUserIdIfAuthorizedOrSetError(req : NextApiRequest, res : NextApiResponse, resourceId : string, actionId : Action ){
  const userId = await getUserIdOrSetError(req, res);
  const aclQuery = `SELECT aclId FROM resourceaccess WHERE resourceId = ? AND actionId = ?`;
  const acl: { aclId: string }[] = await executeAndEndSet500OnError(
    aclQuery,
    [resourceId, actionId],
    res
  );
  if(await isMemberOfAcl(acl[0].aclId, userId))
    return userId;
  return undefined;
}

export function blogResourceId() {
  return '/blog';
}



export function commentResourceId(courseId: string, instance: string) {
  return `/course/${courseId}/instance/${instance}/comments`;
}
