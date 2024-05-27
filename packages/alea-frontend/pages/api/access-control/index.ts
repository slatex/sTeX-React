import { NextApiRequest, NextApiResponse } from 'next';
import { executeAndEndSet500OnError } from '../comment-utils';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method == 'POST') {
        const { description, updaterId, isOpen } = req.body;
        if(!description||!updaterId||isOpen==null){
            res.status(422).end()
        }
        await executeAndEndSet500OnError(`INSERT INTO AccessControlList (description, updaterACLId, isOpen)
        VALUES (?, ?, ?);`, [description, updaterId, isOpen], res);
        res.status(201).end();
    }
    else if (req.method == "GET") {
        const result = await executeAndEndSet500OnError(`select * from AccessControlList`, [], res);
        res.status(200).send(result);
    }
    res.status(404).end();
}