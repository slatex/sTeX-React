import { NextApiRequest, NextApiResponse } from "next";
import { checkIfGetOrSetError, getUserIdOrSetError } from "../comment-utils";
import { isMemberOfAcl } from "../acl-utils/acl-commen-utils";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (!checkIfGetOrSetError(req, res)) return;
    const id = req.query.id as string;
    const userId = await getUserIdOrSetError(req, res);
    if (!id) return res.status(422).send(`Missing param id.`);
    res.send(await isMemberOfAcl(id, userId));
}