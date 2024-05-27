import { NextApiRequest, NextApiResponse } from "next";
import { executeAndEndSet500OnError } from "../../../comment-utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method == "POST") {
        const data = req.body;
        const aclId = req.query.aclid;
        const aclMember: string = data.aclMember;
        const userMemeber: string = data.userMemeber;
        if (!aclMember && !userMemeber || userMemeber && aclMember)
            res.status(422).end();

        await executeAndEndSet500OnError(`INSERT INTO ACLMembership (parentACLId, memberACLId, memberUserId)
        VALUES (?, ?, ?);`, [aclId, aclMember, userMemeber], res);
        res.status(201).end();
    }
}       