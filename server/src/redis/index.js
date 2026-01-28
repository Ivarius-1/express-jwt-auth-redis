import { createClient } from "redis";

export const redis = createClient({
    url: 'redis://localhost:6379'
})

redis.on('connect', (e)=>{
    console.log("Redis started")
})

redis.on('error', (e) => {
    console.error(`Redis error ${e}`)
})

await redis.connect()