import { NextApiRequest, NextApiResponse } from "next";
import { checkIfPostOrSetError, executeAndEndSet500OnError } from "../../../comment-utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (!checkIfPostOrSetError(req, res))
        return;
    const data = req.body;
    const aclId = req.query.aclid;
    const aclMember: string = data.aclMember;
    const userMember: string = data.userMember;
    if (!aclMember && !userMember || userMember && aclMember) {
        res.status(422).end();
        return;
    }
    //TODO: Check the user have right to add member or a acl to the this acl, this should be done in redis flatten.
    const isOpen = (await executeAndEndSet500OnError(`select isOpen from AccessControlList Where id=?`, [aclId], res))[0];
    if (!isOpen) {
        res.status(403).end();
        return;
    }
    await executeAndEndSet500OnError(`INSERT INTO ACLMembership (parentACLId, memberACLId, memberUserId)
        VALUES (?, ?, ?);`, [aclId, aclMember, userMember], res);
    res.status(201).end();
}       