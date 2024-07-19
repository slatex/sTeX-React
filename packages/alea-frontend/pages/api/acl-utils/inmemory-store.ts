import { RedisKey } from 'ioredis';
import { AbstractCacheStore, CacheValueType } from './abstract-cache-store';

export class InMemoryStore extends AbstractCacheStore {
  cache: Map<RedisKey, CacheValueType | CacheValueType[]> = new Map();
  async setEntry(key: RedisKey, data: CacheValueType) {
    this.cache.set(key, data);
    return { error: null };
  }
  async getEntry(key: RedisKey) {
    return this.cache.get(key) as string | { error: any };
  }
  async addToSet(key: RedisKey, members: CacheValueType[]) {
    this.cache.set(key, members);
  }
  async getFromSet(key: RedisKey): Promise<CacheValueType[]> {
    return this.cache.get(key) as CacheValueType[];
  }
  async isMemberOfSet(key: RedisKey, member: CacheValueType) {
    const cachedValue = this.cache.get(key);
    if (Array.isArray(cachedValue)) {
      return cachedValue.includes(member);
    } else {
      return false;
    }
  }
}
