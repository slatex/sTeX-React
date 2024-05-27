import { NextApiRequest, NextApiResponse } from "next";
import { checkIfTypeOrSetError, executeAndEndSet500OnError } from "../../../comment-utils";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!checkIfTypeOrSetError(res, req, 'DELETE'))
        return;
    await executeAndEndSet500OnError(`DELETE FROM ACLMembership WHERE id=?;`, [req.query.memberid], res);
    res.status(200).end();

}       