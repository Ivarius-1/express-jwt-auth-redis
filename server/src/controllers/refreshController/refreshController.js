import { redis } from "../../redis/index.js";
import jwt from 'jsonwebtoken'

export class refreshController{
    refresh = async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken

            if(!refreshToken){
                return res.status(401).json({error:"Токен не найден"})
            }

            const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)

            const {userId, tokenId} = payload

            const storedTokenId = await redis.get(`refresh:${userId}`)
            if(!storedTokenId || storedTokenId !== tokenId){
                return res.status(401).json({error:"Недействительный токен"})
            }

            const accessToken = jwt.sign(
                {id:userId},
                process.env.JWT_SECRET,
                {expiresIn:process.env.JWT_EXPIRES}
            )

            res.cookie('accessToken', accessToken,{
                httpOnly:true,
                secure:false,
                sameSite:'strict',
                maxAge: 15 * 60 * 1000
            })

            res.json({status:true})
        } catch (e) {
            res.status(401).json({message:"Токен истёк или невалиден"})
        }
    }
}