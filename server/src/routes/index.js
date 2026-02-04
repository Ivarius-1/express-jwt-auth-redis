import { Router } from "express";
import { registrationController } from "../controllers/userControllers/registrationController.js";
import { authorizationController } from "../controllers/userControllers/authorizationController.js";
import { postController } from "../controllers/postControllers/postController.js";
import { refreshController } from "../controllers/refreshController/refreshController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { rateLimit } from "../middleware/rateLimited.js";
import { profileController } from "../controllers/userControllers/profileController.js";
import { uploadAvatar } from "../middleware/fileMiddleware.js";

export const route = new Router()

const regController = new registrationController()
const authController = new authorizationController()
const poController = new postController()
const refrController = new refreshController()
const userController = new profileController()

route.post('/regUser', rateLimit({keyPrefix:'reg', limit:3, windowSec:60}), regController.regUser)

route.post('/authUser', rateLimit({keyPrefix: 'auth', limit:5, windowSec:60}), authController.authUser)
route.post('/logoutUser', authMiddleware, authController.logoutUser)

route.post('/avatar', authMiddleware, rateLimit({keyPrefix:'upload-avatar', limit:3, windowSec:60}), uploadAvatar.single('avatar'), userController.avatar)

route.post('/posts', authMiddleware, rateLimit({keyPrefix:'create-post', limit:30, windowSec:60}), poController.createPost)
route.get('/posts', authMiddleware, poController.getPosts)

route.post('/refresh', rateLimit({keyPrefix:'refresh', limit:10, windowSec:60}), refrController.refresh)