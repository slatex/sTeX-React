import { RedisKey } from 'ioredis';
import { NextApiResponse } from 'next';

export type CacheValueType = string | Buffer | number;

export abstract class AbstractCacheStore {
  abstract setEntry(key: RedisKey, data: CacheValueType): Promise<{ error: any }>;
  abstract getEntry(key: RedisKey): Promise<string | { error: any }>;
  abstract addToSet(key: RedisKey, members: CacheValueType[]): Promise<void>;
  abstract getFromSet(key: RedisKey): Promise<CacheValueType[]>;
  abstract isMemberOfSet(key: RedisKey, member: CacheValueType): Promise<boolean>;
}

export async function getCacheEntryAndEndSet500OnError<T>(
  store: AbstractCacheStore,
  key: RedisKey,
  res: NextApiResponse
) {
  const result = await store.getEntry(key);
  if (result['error']) {
    res.status(500).send(result);
    console.log(result['error']);
    return undefined;
  }
  return result as T;
}

export async function setCacheEntryAndEndSet500OnError(
  store: AbstractCacheStore,
  key: RedisKey,
  data: CacheValueType,
  res: NextApiResponse
): Promise<void> {
  const result = await store.setEntry(key, data);
  if (result['error']) {
    res.status(500).send(result['error']);
  }
}
