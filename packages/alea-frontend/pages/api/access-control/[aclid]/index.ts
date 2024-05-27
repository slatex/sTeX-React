import { NextApiRequest, NextApiResponse } from "next";
import { executeAndEndSet500OnError, getUserIdOrSetError } from "../../comment-utils";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method == 'GET') {
        const acl = (await executeAndEndSet500OnError(`select * from AccessControlList where id=?`, [req.query.aclid], res))[0];
        const members = await executeAndEndSet500OnError('select * from ACLMembership where parentACLId=?', [req.query.aclid], res);
        res.send({ acl, members });
    }
    else if (req.method == 'PUT') {
        const userId = await getUserIdOrSetError(req, res);
        const { description, updaterId, isOpen } = req.body;
        if (!description || !updaterId || isOpen==null) {
            res.status(422).end();
            return;
        }
        const updaterACLIder = (await executeAndEndSet500OnError<Array<any>>(`SELECT AccessControlList.id FROM AccessControlList
        INNER JOIN
            ACLMembership
        ON 
            AccessControlList.id = ACLMembership.parentACLId
        WHERE
        ACLMembership.memberUserId =?`, [userId], res)).map(c => c.id);
        await executeAndEndSet500OnError(`UPDATE AccessControlList SET description=?, updaterACLId=?, isOpen=? where id=? AND updaterACLId in (?)`,
            [description, updaterId, isOpen, req.query.aclid, updaterACLIder], res);
        res.status(200).end();
    }
    res.status(404).end();
}