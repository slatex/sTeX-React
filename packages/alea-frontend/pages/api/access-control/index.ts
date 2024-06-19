import { NextApiRequest, NextApiResponse } from 'next';
import { executeAndEndSet500OnError } from '../comment-utils';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method == 'POST') {
        const { id, description, isOpen, memberIds, memberACLs} = req.body;
        const updaterId = req.body.updaterId ?? id;
        if (!id || !description || isOpen == null) {
            res.status(422).end();
            return;
        }
        await executeAndEndSet500OnError(`INSERT INTO AccessControlList (id,description,updaterACLId ,isOpen)
        VALUES (?,?, ?,?);`, [id, description, updaterId, isOpen], res);
        
        for(const memberId of memberIds){
            await executeAndEndSet500OnError(`INSERT INTO ACLMembership (parentACLId, memberACLId, memberUserId)
            VALUES (?, ?, ?);`, [id, null, memberId], res);
        }

        for(const memberAcl of memberACLs){
            await executeAndEndSet500OnError(`INSERT INTO ACLMembership (parentACLId, memberACLId, memberUserId)
            VALUES (?, ?, ?);`, [id, memberAcl, null], res);
        }

        res.status(201).end();
    }
    else if (req.method == "GET") {
        const result = await executeAndEndSet500OnError(`select id from AccessControlList`, [], res);
        res.status(200).send(result);
    }
    res.status(404).end();
}