import { NextApiRequest, NextApiResponse } from "next";
import { executeAndEndSet500OnError } from "../../comment-utils";


export default async function handler(req:NextApiRequest, res:NextApiResponse){
    if(req.method=='GET'){
        const members = await executeAndEndSet500OnError('select memberUserId from ACLMembership where parentACLId=?', [req.query.aclid], res);
        res.send( members);
    }
}