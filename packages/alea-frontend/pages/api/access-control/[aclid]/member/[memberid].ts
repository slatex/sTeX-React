import { NextApiRequest, NextApiResponse } from "next";
import { executeAndEndSet500OnError } from "../../../comment-utils";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method == "DELETE") {
        await executeAndEndSet500OnError(`DELETE FROM ACLMembership WHERE id=?;`,[req.query.memberid],res)
        res.status(200).end();
    }
}       