import { NextApiRequest, NextApiResponse } from 'next';
import { executeAndEndSet500OnError } from '../comment-utils';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method == 'POST') {
        const { id, description, isOpen } = req.body;
        const updaterId = req.body.updaterId ?? id;
        if (!id || !description || isOpen == null) {
            res.status(422).end();
            return;
        }
        await executeAndEndSet500OnError(`INSERT INTO AccessControlList (id,description,updaterACLId ,isOpen)
        VALUES (?,?, ?,?);`, [id, description, updaterId, isOpen], res);
        res.status(201).end();
    }
    else if (req.method == "GET") {
        const result = await executeAndEndSet500OnError(`select * from AccessControlList`, [], res);
        res.status(200).send(result);
    }
    res.status(404).end();
}