import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export class profileController{
    avatar = async(req, res) => {
    try{
        const userId = req.user.id
        const avatarPath = `avatars/${userId}/${req.file.filename}`

        await prisma.user.update({
            where:{id:userId},
            data:{avatar: avatarPath}
        })

        res.json({
            status: true,
            avatar: `/static/${avatarPath}`
        })
    } catch (e) {
        console.log(`Ошибка добавления аватарки ${e}`)
        res.json({
            status:false,
            error: 'Ошибка добавления аватарки '
        })
    }
    }
}