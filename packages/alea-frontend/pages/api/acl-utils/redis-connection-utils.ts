import Redis, { RedisKey } from "ioredis";
import { NextApiResponse } from "next";

const db = new Redis({
    port: +process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    lazyConnect: true,
    password: process.env.REDIS_PASSWORD,
    username: process.env.REDIS_USERNAME
});
export async function set(key: RedisKey, data: string | Buffer | number) {
    try {
        await db.set(key, data);
    } catch (error) {
        return { error };
    }
}
export async function get(key: RedisKey) {
    try {
        return await db.get(key);
    }
    catch (error) { return { error }; }
}
export async function setAndEndSet500OnError(key: RedisKey, data: string | Buffer | number, res: NextApiResponse) {
    const result = await set(key, data);
    if (result['error']) {
        res.status(500).send(result['error']);
    }
}
export async function getAndEndSet500OnError<T>(key: RedisKey, res: NextApiResponse): Promise<T> {
    const result = await get(key);
    if (result['error']) {
        res.status(500).send(result);
        console.log(result['error']);
        return undefined;
    }
    return result as T;
}
export async function addSet(key: RedisKey, members: (string | Buffer | number)[]) {
    await db.sadd(key, members);
}
export async function getSet(key: RedisKey): Promise<(string | Buffer | number)[]> {
    return await db.smembers(key);
}