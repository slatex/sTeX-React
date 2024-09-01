import { NextApiRequest, NextApiResponse } from "next";
import { getUserIdForStudyBuddyModerationOrSetError } from "./resource-utils";


export async function handler(req : NextApiRequest, res : NextApiResponse){
    const courseId = req.query.courseId as string;
    const instanceId = req.query.courseTerm as string;
    const userId = await getUserIdForStudyBuddyModerationOrSetError(req, res, courseId, instanceId);
    if(!userId) return res.status(403).send(false);
    return res.status(200).send(true);
}