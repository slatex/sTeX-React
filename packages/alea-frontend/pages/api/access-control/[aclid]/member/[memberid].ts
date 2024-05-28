import { NextApiRequest, NextApiResponse } from "next";
import { checkIfDeleteOrSetError, executeAndEndSet500OnError, getUserIdOrSetError } from "../../../comment-utils";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!checkIfDeleteOrSetError(req, res))
        return;
    const userId = await getUserIdOrSetError(req, res);
    const { memberid, aclid } = req.query;
    const { updaterACLId, isOpen } = await executeAndEndSet500OnError<any>(`SELECT isOpen,updaterACLId FROM AccessControlList WHERE id=?`, [aclid], res);
    const isMember = (await executeAndEndSet500OnError<Array<any>>(`SELECT count(AccessControlList.id) as conter FROM AccessControlList
        INNER JOIN
            ACLMembership
        ON 
            AccessControlList.id = ACLMembership.parentACLId
        WHERE
        ACLMembership.memberUserId =? and AccessControlList.id`, [userId, updaterACLId], res))[0].conter;
    if (isOpen || isMember > 0) {
        await executeAndEndSet500OnError(`DELETE FROM ACLMembership WHERE id=?;`, [memberid], res);
        res.status(200).end();
    }
    res.status(403).end();
}       