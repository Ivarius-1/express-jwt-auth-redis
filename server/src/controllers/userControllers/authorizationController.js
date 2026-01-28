import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'
import { redis } from "../../redis/index.js";
import { prisma } from '../../prisma/prisma.js';

export class authorizationController{
    authUser = async (req, res) => {
    try {
        const {login, password} = req.body

        const user = await prisma.user.findUnique({where:{login}})
        if(!user){
            res.status(401).json({error:"Неверный логин или пароль"})
        }
        const validPassword = bcrypt.compare(password, user.password)
        if(!validPassword){
            res.status(401).json({error:"Неверный логин или пароль"})
        }

        const accessToken = jwt.sign(
            {
                id: user.id
            },
            process.env.JWT_SECRET,
            {expiresIn:process.env.JWT_EXPIRES}
        )

        const tokenId = randomUUID()
        const refreshToken = jwt.sign(
            {
                userId: user.id,
                tokenId
            },
            process.env.JWT_REFRESH_SECRET,
            {expiresIn:process.env.JWT_REFRESH_EXPIRES}
        )

        await redis.set(
            `refresh:${user.id}`,
            tokenId,
            { EX: 30 * 24 * 60 * 60 }
        )

        const updateUser = await prisma.user.update({
            where:{login},
            data:{online:true}
        })

        res.cookie('accessToken', accessToken,{
            httpOnly:true,
            secure:false,
            sameSite:'strict',
            maxAge:15 * 60 * 1000
        })
        res.cookie('refreshToken', refreshToken, {
            httpOnly:true,
            secure:false,
            sameSite:'strict',
            maxAge:30 * 24 * 60 * 60 * 1000
        })
        res.json({
            status:true,
            message:"Успешный вход",
            user:{
                id:user.id,
                login:user.login,
                online:user.online
            }
        })
        console.log(`Пользователь ${user.login} вошёл в акканут`)
    
    } catch (e){
        console.log(`Ошибка авторизации ${e}`)
        res.json({
            status:false,
            message:"Ошибка авторизации"
        })
    }
}
    logoutUser = async (req,res) => {
        try{
            const user = await prisma.user.update({
                where:{id: req.user.id},
                data:{online:false}
            })

            await redis.del(`refresh:${req.user.id}`)
            res.clearCookie('accessToken')
            res.clearCookie('refreshToken')

            res.json({
                status:true,
                message:"Успешный выход"
            })
        } catch (e) {
            console.log(`Ошибка при выходе ${e}`)
            res.json({
                status:true,
                message:"Ошибка при выходе"
            })
        }
    }
}