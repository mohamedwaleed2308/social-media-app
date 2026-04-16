import { Server } from "socket.io"
import { logoutSocketId, registration } from "./socket.service.js"
import { sendMessage } from "./message.socket.js"



export const runIo = (httpServer) => {

    const io = new Server(httpServer, {
        cors: '*'
    })

    return io.on('connection', async (socket) => {
        await registration(socket)
        await sendMessage(socket)
        await logoutSocketId(socket)
    })
} 