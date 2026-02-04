import multer from "multer";
import fs from 'fs'
import path from 'path'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userId = req.user.id
        const dir = path.resolve(`uploads/avatars/${userId}`) 

        if(!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true })
        }

        cb(null, dir)
    },
    filename: (req, file, cb) => {
        cb(null, 'avatar' + path.extname(file.originalname))
    }
})

const fileFilter = (req, file, cb) => {
    if(!file.mimetype.startsWith('image/')) {
        return cb(new Error('Можно загружать только изображения '))
    }
    cb(null, true)
}

export const uploadAvatar = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024}
})