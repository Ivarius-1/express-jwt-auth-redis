import { redis } from "../redis/index.js";

export const rateLimit = ({ keyPrefix, limit, windowSec }) => {
    return async (req, res, next) => {
        try {
            const identifier = req.user?.id || req.ip
            const key = `${keyPrefix}:${identifier}`

            const current = await redis.incr(key)
            
            if(current === 1){
                await redis.expire(key, windowSec)
            }
            if( current > limit){
                return res.status(429).json({error:"Слишком много запросов повторите позже"})
            }

            next()
        } catch (e) {
            console.log(`Ошибка лимита ${e}`)
            next()
        }
    }
}