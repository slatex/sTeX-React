import { NextApiRequest, NextApiResponse } from 'next';
import { executeAndEndSet500OnError } from '../comment-utils';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method == 'POST') {
        const { description, isOpen } = req.body;
        if (!description || isOpen == null) {
            res.status(422).end();
        }
        const id = (await executeAndEndSet500OnError(`INSERT INTO AccessControlList (description, isOpen)
        VALUES (?, ?);`, [description, isOpen], res))['insertId'];
        const updaterId = req.body.updaterId ?? id;
        await executeAndEndSet500OnError(`UPDATE AccessControlList SET updaterACLId=? where id=?`,
            [updaterId, id], res);
        res.status(201).end();
    }
    else if (req.method == "GET") {
        const result = await executeAndEndSet500OnError(`select * from AccessControlList`, [], res);
        res.status(200).send(result);
    }
    res.status(404).end();
}