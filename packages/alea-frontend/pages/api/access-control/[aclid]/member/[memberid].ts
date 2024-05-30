import { NextApiRequest, NextApiResponse } from "next";
import { checkIfDeleteOrSetError, executeAndEndSet500OnError, getUserIdOrSetError } from "../../../comment-utils";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!checkIfDeleteOrSetError(req, res))
        return;
    const userId = await getUserIdOrSetError(req, res);
    const { memberid } = req.query;
    //TODO: Check the user have right to delete member or a acl to the this acl, this should be done in redis flatten.
    //TODO: Only the user can delete themself from list.
    await executeAndEndSet500OnError(`DELETE FROM ACLMembership WHERE id=? and memberUserId=?;`, [memberid, userId], res);
    res.status(200).end();
}       