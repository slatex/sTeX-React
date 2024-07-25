import { NextApiRequest, NextApiResponse } from "next";
import { checkIfGetOrSetError, executeQuery, getUserIdOrSetError } from "../comment-utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(!checkIfGetOrSetError) return;
    const {postId} = req.query;
    const userId = await getUserIdOrSetError(req, res);
    const authorId : {authorId : string}[] = await executeQuery(`SELECT authorId FROM BlogPosts WHERE postId = ?`, [postId]);
    console.log(userId, authorId);
    if(authorId.length > 0 && authorId[0].authorId === userId)
        res.status(200).json({canEdit: true});
    return res.status(200).json({canEdit: false});
}