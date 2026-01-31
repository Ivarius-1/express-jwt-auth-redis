
import { z } from 'zod'

export const registerSchema = z.object({
    login: z
        .string()
        .min(3, 'Логин слишком короткий')
        .max(15, 'Логин слишком длинный')
        .regex(/^[a-zA-Z0-9_]+$/, 'Только латиница, цифры и _'),
    password: z
        .string()
        .min(4, 'Пароль слишком короткий'),
})