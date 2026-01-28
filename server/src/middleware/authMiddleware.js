import jwt from 'jsonwebtoken'

export const authMiddleware = (req, res, next) => {
    const token = req.cookies.accessToken
    if(!token){
        return res.status(401).json({error:"Токен не найден"})
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
    } catch (e) {
        res.status(403).json({error:"Неверный или просроченный токен"})
    }
}