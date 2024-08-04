import Redis, { RedisKey } from 'ioredis';
import { AbstractCacheStore, CacheValueType } from './abstract-cache-store';
import { RedisInstance } from './redis-utils';

export class RedisStore extends AbstractCacheStore {
  private db = RedisInstance;
  async setEntry(key: RedisKey, data: CacheValueType): Promise<{ error: any }> {
    try {
      await this.db.set(key, data);
    } catch (error) {
      return { error };
    }
  }

  async getEntry(key: RedisKey): Promise<string | { error: any }> {
    try {
      return await this.db.get(key);
    } catch (error) {
      return { error };
    }
  }

  async addToSet(key: RedisKey, members: CacheValueType[]): Promise<void> {
    await this.db.sadd(key, members);
  }

  async getFromSet(key: RedisKey): Promise<CacheValueType[]> {
    return await this.db.smembers(key);
  }

  async isMemberOfSet(key: RedisKey, member: CacheValueType): Promise<boolean> {
    return (await this.db.sismember(key, member)) === 0 ? false : true;
  }
}
