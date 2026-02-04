import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path'
import { fileURLToPath } from 'url'
import { route } from './routes/index.js'

const _filename = fileURLToPath(import.meta.url)
const _dirname = path.dirname(_filename)

export const app = express()

app.use(express.json())
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))
app.use(cookieParser(process.env.COOKIE_SECRET))

app.use('/app', route)

app.use('/static', express.static(path.join(_dirname,'uploads')))
app.use(express.static(path.join(_dirname, '../../client/src')))

app.get('/', (req, res) => {
    res.sendFile(path.join(_dirname, '../../client/src', 'index.html'))
})