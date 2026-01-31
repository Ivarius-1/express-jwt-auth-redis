import { prisma } from '../../prisma/prisma.js'
import { registerSchema } from '../../validators/auth.schema.js'
import bcrypt from 'bcrypt'

export class registrationController{
    regUser = async (req, res) => {
        try {
            const validated = registerSchema.parse(req.body)
            const { login, password } = validated
            const hashedPassword = await bcrypt.hash(password, 10)
            const user = await prisma.user.create({
                data: {
                    login,
                    password: hashedPassword,
                    online: false
                }
            })
            res.status(201).json({
                status: true,
                message:"Пользователь успешно зарегистрирован"
            })
            console.log(user)
        } catch (e) {
            console.log(`Ошибка регистрации ${e}`)

            res.status(500).json({
                status: false,
                message: "Ошибка регистрации"
            })  
        }
    }
}