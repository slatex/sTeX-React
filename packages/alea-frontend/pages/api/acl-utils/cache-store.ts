import { InMemoryStore } from "./inmemory-store";
import { RedisStore } from "./redis-store";

export const CACHE_STORE = process.env["CACHE_STORE"] === "redis" ? new RedisStore() : new InMemoryStore();