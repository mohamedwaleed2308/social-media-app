import { Server } from 'socket.io'
import express from 'express'
import * as dotenv from 'dotenv'
import path from 'node:path'
import Bootstrap from './src/app.controller.js'
import { runIo } from './src/module/socket/socket.controller.js'
dotenv.config({ path: path.resolve('./src/config/.env') })
const app = express()
const port = 3000;


Bootstrap(app, express)
const httpServer = app.listen(port, () => console.log(`Example app listening on port ${port}!`))

runIo(httpServer)



