import { RedisKey } from "ioredis";
import { AbstractCacheStore } from "./abstract-cache-store";
import { NextApiResponse } from "next";


export class InMemoryStore extends AbstractCacheStore{
    cache: Map<RedisKey, (string | Buffer | number ) | (string | Buffer | number )[]> = new Map();
    async setCacheEntry(key: RedisKey, data: string | Buffer | number ) {
        this.cache.set(key, data);
        return { error: null };
    }
    async getCacheEntry(key: RedisKey) {
        return this.cache.get(key) as string | { error: any; };
    }
    async setCacheEntryAndEndSet500OnError(key: RedisKey, data: string | Buffer | number, res: NextApiResponse) {
        const result = await this.setCacheEntry(key, data);
        if (result['error']) {
            res.status(500).send(result['error']);
        }
    }
    async getCacheEntryAndEndSet500OnError<T>(key: RedisKey, res: NextApiResponse) {
        const result =  this.getCacheEntry(key);
        if (result['error']) {
            res.status(500).send(result);
            return undefined;
        }
        return result as T;
    }
    async addToCachedSet(key: RedisKey, members: (string | Buffer | number)[]) {
        this.cache.set(key, members);
    }
    async getFromCachedSet(key: RedisKey): Promise<(string | Buffer | number)[]> {
        return this.cache.get(key) as (string | Buffer | number)[];
    }
    async isMemberOfCachedSet(key: RedisKey, member: string | Buffer | number) {
        const cachedValue = this.cache.get(key);
        if (Array.isArray(cachedValue)) {
            return cachedValue.includes(member);
        } else {
            return false;
        }
    }
}

