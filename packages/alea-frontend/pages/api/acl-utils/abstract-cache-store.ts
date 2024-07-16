import { RedisKey } from "ioredis";
import { NextApiResponse } from "next";


export abstract class AbstractCacheStore {
    abstract setCacheEntry(key: RedisKey, data: string | Buffer | number): Promise<{error: any}>
    abstract getCacheEntry(key: RedisKey): Promise<string | {error: any}>
    abstract setCacheEntryAndEndSet500OnError(key: RedisKey, data: string | Buffer | number, res: NextApiResponse): Promise<void>
    abstract getCacheEntryAndEndSet500OnError(key: RedisKey, res: NextApiResponse): Promise<string | {error: any}>;
    abstract addToCachedSet(key: RedisKey, members: (string | Buffer | number)[]): Promise<void>;
    abstract getFromCachedSet(key: RedisKey): Promise<(string | Buffer | number)[]>;
    abstract isMemberOfCachedSet(key: RedisKey, member: string | Buffer | number): Promise<boolean>;
}

