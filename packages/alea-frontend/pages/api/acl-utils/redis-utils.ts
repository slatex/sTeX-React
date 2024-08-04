import { Redis } from "ioredis";

export const RedisInstance = new Redis({
    port: +process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    lazyConnect: true,
    password: process.env.REDIS_PASSWORD,
    username: process.env.REDIS_USERNAME,
})