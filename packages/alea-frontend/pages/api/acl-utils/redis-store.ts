import Redis, { RedisKey } from "ioredis";
import { NextApiResponse } from "next";
import { AbstractCacheStore } from "./abstract-cache-store";


export class RedisStore extends AbstractCacheStore{

    private db = new Redis({
        port: +process.env.REDIS_PORT,
        host: process.env.REDIS_HOST,
        lazyConnect: true,
        password: process.env.REDIS_PASSWORD,
        username: process.env.REDIS_USERNAME
    });

    async setCacheEntry(key: RedisKey, data: string | Buffer | number) : Promise<{error: any}> {
        try {
            await this.db.set(key, data);
        } catch (error) {
            return { error };
        }
    }
    async  getCacheEntry(key: RedisKey): Promise<string | {error: any}> {
        try {
            return await this.db.get(key);
        }
        catch (error) { return { error }; }
    }
    async setCacheEntryAndEndSet500OnError(key: RedisKey, data: string | Buffer | number, res: NextApiResponse) : Promise<void> {
        const result = await this.setCacheEntry(key, data);
        if (result['error']) {
            res.status(500).send(result['error']);
        }
    }
    async getCacheEntryAndEndSet500OnError<T>(key: RedisKey, res: NextApiResponse): Promise<T> {
        const result = await this.getCacheEntry(key);
        if (result['error']) {
            res.status(500).send(result);
            console.log(result['error']);
            return undefined;
        }
        return result as T;
    }
    async addToCachedSet(key: RedisKey, members: (string | Buffer | number)[]): Promise<void> {
        await this.db.sadd(key, members);
    }
    async  getFromCachedSet(key: RedisKey): Promise<(string | Buffer | number)[]> {
        return await this.db.smembers(key);
    }
    async isMemberOfCachedSet(key: RedisKey, member: string | Buffer | number): Promise<boolean> {
        return (await this.db.sismember(key, member)) === 0 ? false : true;
    }
}



