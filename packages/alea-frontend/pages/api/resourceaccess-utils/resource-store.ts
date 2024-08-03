import { ResourceAction } from '@stex-react/api';
import { RedisCache } from './redis-cache';
import { InmemoryCache } from './inmemory-cache';
import { executeQuery } from '../comment-utils';

function createResourceCacheSingleton() {
  return process.env['CACHE_STORE'] === 'redis' ? new RedisCache() : new InmemoryCache();
}

declare global {
  var RESOURCE_CACHE: undefined | ReturnType<typeof createResourceCacheSingleton>;
}

export const RESOURCE_CACHE =
  globalThis.RESOURCE_CACHE ?? (globalThis.RESOURCE_CACHE = createResourceCacheSingleton());

(async function initializeResourceCache() {
  console.log('Initializing ResourceCache');
  try {
    const resourceAccessData = await executeQuery<ResourceAction[]>(
      'SELECT * FROM ResourceAccess',
      []
    );
    if ('error' in resourceAccessData) {
      console.error('Error fetching ResourceAccessData', resourceAccessData['error']);
      return;
    }
    await RESOURCE_CACHE.initialize(resourceAccessData);
  } catch (error) {
    console.error('Error during ResourceCache initialization:', error);
  }
})();
