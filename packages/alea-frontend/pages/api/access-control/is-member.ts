import { NextApiRequest, NextApiResponse } from "next";
import { checkIfGetOrSetError } from "../comment-utils";
import { isMemberOfAcl } from "../acl-utils/acl-common-utils";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (!checkIfGetOrSetError(req, res)) return;
    const { id, userId } = req.query;
    if (!id || !userId) return res.status(422).send(`Missing param(s).`);
    res.send(await isMemberOfAcl(id as string, userId as string));
}