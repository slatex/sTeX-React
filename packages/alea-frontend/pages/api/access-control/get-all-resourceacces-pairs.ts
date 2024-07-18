import { NextApiRequest, NextApiResponse } from "next";
import { checkIfGetOrSetError, executeAndEndSet500OnError, getUserIdOrSetError } from "../comment-utils";
import { isMemberOfAcl } from "../acl-utils/acl-common-utils";

export default async function handler(req : NextApiRequest, res : NextApiResponse){
    if(!checkIfGetOrSetError(req, res)) return;
    const userId = await getUserIdOrSetError(req, res);
    if(!await isMemberOfAcl('sys-org', userId)){
        return res.send('not valid');
    }
    const query = `SELECT * FROM resourceaccess`;
    const result = await executeAndEndSet500OnError(query, [], res);
    return res.status(200).send(result);
}