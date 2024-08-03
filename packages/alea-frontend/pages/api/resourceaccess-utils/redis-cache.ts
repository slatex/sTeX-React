import { Redis } from 'ioredis';
import { ResourceAbstractCacheStore } from './resource-cache-store';
import { ResourceAction } from '@stex-react/api';
import { getCacheKey } from './resource-common-utils';

export class RedisCache extends ResourceAbstractCacheStore {
  private db = new Redis({
    port: +process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    lazyConnect: true,
    password: process.env.REDIS_PASSWORD,
    username: process.env.REDIS_USERNAME,
  });
  async initialize(resourceAccessData: ResourceAction[]) {
    console.log('initializing in redis');
    this.storeResourceAccessData(resourceAccessData);
  }
  async storeResourceAccessData(resourceAccessData: ResourceAction[]) {
    for (const resource of resourceAccessData) {
      console.log('in the loop for every resource');
      const key = getCacheKey(resource.resourceId, resource.actionId);
      await this.db.set(key, resource.aclId);
    }
  }
  async getAclId(resourceId: string, actionId: string): Promise<string | { error: any }> {
    const key = getCacheKey(resourceId, actionId);
    const aclId = await this.db.get(key);
    if (!aclId) return undefined;
    return aclId;
  }
}
