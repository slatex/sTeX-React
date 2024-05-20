import dayjs from "dayjs";
import { NextApiRequest, NextApiResponse } from "next";
import { executeAndEndSet500OnError, getMysqlDate } from "../../comment-utils";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method == 'GET') {
        const acl = (await executeAndEndSet500OnError(`select * from AccessControl where id=?`, [req.query.aclid], res))[0];
        const members = await executeAndEndSet500OnError('select * from AccessControlMember where accessControl=?', [req.query.aclid], res);
        res.send({ acl, members });
        return;
    }
    else if (req.method == 'PUT') {
        const data = req.body;
        await executeAndEndSet500OnError(`UPDATE AccessControl SET description=?, updaterId=?, isOpen=?,updatedAt=? where id=?`,
            [data.description, data.updaterId, data.isOpen, getMysqlDate(dayjs()), req.query.aclid], res);
        res.send([]);
        return;
    }
    res.status(404);
    return;
}