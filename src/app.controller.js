import path from 'node:path'
import DBConnection from "./DB/connction.js";
import authController from './module/auth/auth.controller.js'
import userController from './module/user/user.controller.js'
import postController from './module/post/post.controller.js'
import chatController from './module/chat/chat.controller.js'
import { globalErrorHandleing } from "./utils/response/error.response.js";
import cors from 'cors'
import { createHandler } from 'graphql-http/lib/use/express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { schemaPosts } from './module/modules.shema.js';


const limiter= rateLimit({
    limit:3,
    windowMs:2*60*1000,
    message:{err:"rate limit"},
    statusCode:400,
    handler:(req,res,next)=>{
        return next(new Error('maximum rate trial'))
    },
    legacyHeaders:true,
    standardHeaders:'draft-8'
})

const postLimiter= rateLimit({
    limit:2,
    windowMs:1*60*1000
})


const Bootstrap = (app, express) => {
    // var whitelist = ['http://example1.com', 'http://example2.com']
    // var whitelist = process.env.white_list.split(",") || []
    // var corsOptions = {
    //     origin: function (origin, callback) {
    //         if (whitelist.indexOf(origin) !== -1) {
    //             callback(null, true)
    //         } else {
    //             callback(new Error('Not allowed by CORS'))
    //         }
    //     }
    // }
    // app.use(cors(corsOptions))
    app.use(cors())
    // app.use(helmet())
    app.use('/auth',limiter)
    app.use('/post',postLimiter)
    
    app.use('/graphql',createHandler({schema:schemaPosts})) 

    app.use(express.json());// convert buffer into data
    app.use('/uploads', express.static(path.resolve('./src/uploads')))
    // app-routing
    app.get('/', (req, res) => res.send('Hello World!'))
    // sub-routing
    app.use('/auth', authController)
    app.use('/user', userController)
    app.use('/post', postController)
    app.use('/chat', chatController)
    // not-found 
    app.all('*', (req, res, next) => {
        return res.status(404).json({ message: 'Not-Found' })
    });
    app.use(globalErrorHandleing)
    // DB-Connection
    DBConnection()
}

export default Bootstrap;