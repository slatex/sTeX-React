import { NextApiRequest, NextApiResponse } from "next";
import { checkIfGetOrSetError, executeAndEndSet500OnError, getUserIdOrSetError } from "../comment-utils";
import { isModerator } from "@stex-react/api";
import { ACLMembership, Flattening } from "../acl-utils/flattening";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (!checkIfGetOrSetError(req, res)) return;
    const userId = await getUserIdOrSetError(req, res);
    if (!isModerator(userId)) {
        res.status(403).send({ message: 'Unauthorized.' });
        return;
    }
    const output = [];
    const aclMemberships = await executeAndEndSet500OnError<ACLMembership[]>('select * from ACLMembership', [], res);
    const flattening = new Flattening(aclMemberships);
    const result = await executeAndEndSet500OnError<{ id: string; }[]>(`select id from AccessControlList`, [], res);
    for (const element of result) {
        output.push({ name: element.id, members: await flattening.findMembers(element.id), acls: await flattening.findACL(element.id) });
    }
    res.send(output.length);
}