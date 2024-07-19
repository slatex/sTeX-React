import { InMemoryStore } from './inmemory-store';
import { RedisStore } from './redis-store';

function cacheSingleton() {
  return process.env['CACHE_STORE'] === 'redis' ? new RedisStore() : new InMemoryStore();
}

declare global {
  var CACHE_STORE: undefined | ReturnType<typeof cacheSingleton>;
}

export const CACHE_STORE = globalThis.CACHE_STORE ?? cacheSingleton();

if (
  !process.env.NEXT_PUBLIC_SITE_VERSION ||
  process.env.NEXT_PUBLIC_SITE_VERSION === 'development'
) {
  globalThis.CACHE_STORE = CACHE_STORE;
}
