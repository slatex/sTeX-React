import { NextApiRequest, NextApiResponse } from "next";
import { checkIfGetOrSetError, executeAndEndSet500OnError } from "../comment-utils";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (!checkIfGetOrSetError(req, res)) return;
    const id = req.query.id as string;
    if (!id) return res.status(422).send(`Missing param id.`);
    const result=await executeAndEndSet500OnError<[]>('SELECT id FROM AccessControlList WHERE id =?',[id],res)
    res.send(result.length>0);
}