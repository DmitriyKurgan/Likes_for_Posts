import express from "express";
import bodyParser from "body-parser";
import {blogsRouter} from "./routers/blogsRouter";
import {postsRouter} from "./routers/posts-router";
import {usersRouter} from "./routers/users-router";
import {authRouter} from "./routers/auth-router";
import {commentsRouter} from "./routers/comments-router";
import {testingRouter} from "./routers/testing-router";
import cookieParser from "cookie-parser";
import cors from 'cors';
import {securityDevicesRouter} from "./routers/securityDevicesRouter";

export const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors({
    origin: ['https://bloger-platform.vercel.app', 'https://blogger-platform-admin.vercel.app', 'http://localhost:3000'],
    credentials: true
}))
app.set('trust proxy', true)

// const parserMiddleware = bodyParser({})

app.use(
    express.json()
)

app.use('/blogs', blogsRouter)
app.use('/posts', postsRouter)
app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use('/comments', commentsRouter)
app.use('/security/devices', securityDevicesRouter)
app.use('/testing', testingRouter)
