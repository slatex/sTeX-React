import { NextApiRequest, NextApiResponse } from "next";
import { executeAndEndSet500OnError } from "../../comment-utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method == "POST") {
        const data = req.body;
        const aclId = req.query.aclid;
        let aclMember: string = null;
        let userMemeber: string = null;
        if ((data.accessControlMember != null && data.userMemeber != null) || (data.userMemeber == null && data.accessControlMember == null)) {
            res.status(422).send(null);
            return;
        }
        if (data.accessControlMember != null) {
            aclMember = data.accessControlMember;
        } else {
            userMemeber = data.userMemeber;
        }
        await executeAndEndSet500OnError(`INSERT INTO AccessControlMember (accessControl, accessControlMember, userMember)
        VALUES (?, ?, ?);`, [aclId, aclMember, userMemeber], res);
        res.status(201).send(null);
        return;
    }
}