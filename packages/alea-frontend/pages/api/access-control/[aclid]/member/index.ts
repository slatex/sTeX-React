import { NextApiRequest, NextApiResponse } from "next";
import { checkIfTypeOrSetError, executeAndEndSet500OnError } from "../../../comment-utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (!checkIfTypeOrSetError(req, res))
        return;
    const data = req.body;
    const aclId = req.query.aclid;
    const aclMember: string = data.aclMember;
    const userMemeber: string = data.userMemeber;
    if (!aclMember && !userMemeber || userMemeber && aclMember) {
        res.status(422).end();
        return;
    }

    await executeAndEndSet500OnError(`INSERT INTO ACLMembership (parentACLId, memberACLId, memberUserId)
        VALUES (?, ?, ?);`, [aclId, aclMember, userMemeber], res);
    res.status(201).end();

}       