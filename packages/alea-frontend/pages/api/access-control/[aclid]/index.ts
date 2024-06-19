import { NextApiRequest, NextApiResponse } from "next";
import { executeAndEndSet500OnError, getUserIdOrSetError } from "../../comment-utils";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method == 'GET') {
        // const acl = (await executeAndEndSet500OnError(`select * from AccessControlList where id=?`, [req.query.aclid], res))[0];
        // const members = await executeAndEndSet500OnError('select * from ACLMembership where parentACLId=?', [req.query.aclid], res);
        // res.send({ acl, members });
        // console.log("aclid" + req.query.aclid);
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
        //TODO: Check the user have right to add member or a acl to the this acl, this should be done in redis flatten.
        await executeAndEndSet500OnError(`UPDATE AccessControlList SET description=?, updaterACLId=?, isOpen=? where id=?`,
            [description, updaterId, isOpen, req.query.aclid], res);
        res.status(200).end();
    }
    // res.status(404).end();
}