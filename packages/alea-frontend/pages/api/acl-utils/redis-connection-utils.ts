import Redis, { RedisKey } from "ioredis";
import { NextApiResponse } from "next";

const db = new Redis({
    port: +process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    lazyConnect: true,
    password: process.env.REDIS_PASSWORD,
    username: process.env.REDIS_USERNAME
});
export async function setCacheEntry(key: RedisKey, data: string | Buffer | number) {
    try {
        await db.set(key, data);
    } catch (error) {
        return { error };
    }
}
export async function getCacheEntry(key: RedisKey) {
    try {
        return await db.get(key);
    }
    catch (error) { return { error }; }
}
export async function setCacheEntryAndEndSet500OnError(key: RedisKey, data: string | Buffer | number, res: NextApiResponse) {
    const result = await setCacheEntry(key, data);
    if (result['error']) {
        res.status(500).send(result['error']);
    }
}
export async function getCacheEntryAndEndSet500OnError<T>(key: RedisKey, res: NextApiResponse): Promise<T> {
    const result = await getCacheEntry(key);
    if (result['error']) {
        res.status(500).send(result);
        console.log(result['error']);
        return undefined;
    }
    return result as T;
}
export async function addToCachedSet(key: RedisKey, members: (string | Buffer | number)[]) {
    await db.sadd(key, members);
}
export async function getFromCachedSet(key: RedisKey): Promise<(string | Buffer | number)[]> {
    return await db.smembers(key);
}
export async function isMemberOfCachedSet(key: RedisKey, member: string | Buffer | number) {
    return (await db.sismember(key, member)) === 0 ? false : true;
}