import { NextApiRequest, NextApiResponse } from 'next';
import {
    executeAndEndSet500OnError,
    getMysqlDate,
} from '../comment-utils';
import dayjs from 'dayjs';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method == 'POST') {
        const data = req.body;
        await executeAndEndSet500OnError(`INSERT INTO AccessControl (description, updaterId, isOpen, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?);`, [data.description, data.updaterId, data.isOpen, getMysqlDate(dayjs()), new Date().toISOString().slice(0, 19).replace('T', ' ')], res);
        res.status(201).send([]);
    }
    else if (req.method == "GET") {
        const result = await executeAndEndSet500OnError(`select * from AccessControl`, [], res);
        res.status(200).send(result);
    }
    res.status(404);
}