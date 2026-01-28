import { prisma } from "../../prisma/prisma.js"

export class postController{
    createPost = async (req, res) => {
        try {
            const {title, description} = req.body
            const userId = req.user.id
            const post = await prisma.post.create({
                data:{
                    title,
                    description,
                    author:{
                        connect: {id: userId}
                    }
                }
            })
            res.json({
                status:true,
                message:"Пост создан"
            })
            console.log(`Пост с названием ${post.title} создан`)
        } catch (e) {
            console.log(`Ошибка создания поста ${e}`)
            res.json({
                status:false,
                message:"Ошибка создания поста"
            })
        }
    }
    getPosts = async(req, res) => {
        try{
            const userId = req.user.id
            const posts = await prisma.post.findMany({
                where:{authorId: userId},
                orderBy: {id:'desc'}
            })
            res.json({
                status:true,
                data:posts
            })
        } catch {
            console.log(`Ошибка при выводе постов ${e}`)
            res.json({
                status:false,
                message:"Ошибка при выводе постов"
            })
        }
    }
}