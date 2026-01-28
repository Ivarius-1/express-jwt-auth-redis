import { prisma } from '../../prisma/prisma.js'
import bcrypt from 'bcrypt'

export class registrationController{
    regUser = async (req, res) => {
        try {
            const {login,password} = req.body
            const hashedPassword = await bcrypt.hash(password, 10)
            const user = await prisma.user.create({
                data: {
                    login,
                    password: hashedPassword,
                    online: false
                }
            })
            res.status(200).json({
                status: true,
                message:"Пользователь успешно зарегистрирован"
            })
            console.log(user)
        } catch (e) {
            console.log(`Ошибка регестрации ${e}`)
            res.json({
                stauts: false,
                message:"Ошибка создания пользователя"
            })
        }
    }
}