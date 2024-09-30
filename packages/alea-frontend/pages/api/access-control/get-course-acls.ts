import { NextApiRequest, NextApiResponse } from "next";
import { checkIfGetOrSetError, executeAndEndSet500OnError } from "../comment-utils";

export default async function handler(req : NextApiRequest, res : NextApiResponse){
    if(!checkIfGetOrSetError(req, res)) return;
    const {courseId, instanceId} = req.query;
    if(!courseId || !instanceId) return res.status(400).send('Missing courseId or instanceId');
    const query = 'SELECT id FROM AccessControlList WHERE id like ?';
    const value = `${courseId}-${instanceId}%`;
    const result = await executeAndEndSet500OnError(query, [value], res);
    if(!result) return;
    return res.status(200).send(result);
}