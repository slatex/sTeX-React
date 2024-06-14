
import { NextApiRequest, NextApiResponse } from "next";
import { executeAndEndSet500OnError } from "../comment-utils";
import { Flattening } from "../acl-utils/flattening";
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const output = [];
    const flattening = new Flattening(res);
    const result = await executeAndEndSet500OnError<{ id: string; }[]>(`select id from AccessControlList`, [], res);
    for (const element of result) {
        output.push({ name: element.id, members: await flattening.findMembers(element.id), acls: await flattening.findACL(element.id) });
    }
    res.send(output);
}
