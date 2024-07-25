import { NextApiRequest, NextApiResponse } from "next";
import { isMemberOfAcl } from "../acl-utils/acl-common-utils";
import { executeAndEndSet500OnError, getUserIdOrSetError } from "../comment-utils";
import { Action } from "@stex-react/utils";

export async function getUserIdIfAuthorizedOrSetError(req : NextApiRequest, res : NextApiResponse, resourceId : string, actionId : Action ){
    const userId : string | undefined = await getUserIdOrSetError(req, res);
    const aclQuery = `SELECT aclId FROM resourceaccess WHERE resourceId = ? AND actionId = ?`;
    const acl: { aclId: string }[] = await executeAndEndSet500OnError(
      aclQuery,
      [resourceId, actionId],
      res
    );
    if(await isMemberOfAcl(acl[0].aclId, userId as string))
      return userId;
    return undefined;
}