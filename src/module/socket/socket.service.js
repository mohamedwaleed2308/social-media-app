import { authenticationSocket } from "../../middleWare/auth.socket.middleware.js"

//                                     key1 , key2
export const socketConnections = new Map() // [value,value]

export const registration = async (socket) => {
    const { data, valid } = await authenticationSocket({ socket })
    if (!valid) {
        return socket.emit('socketError', data)
    }
    socketConnections.set(data.user._id.toString(), socket.id)
    console.log(socketConnections);
    return 'done'
}

export const logoutSocketId = async (socket) => {
    return socket.on('disconnect', async () => {
        const { data, valid } = await authenticationSocket({ socket })
        if (!valid) {
            return socket.emit('socketError', data)
        }
        socketConnections.delete(data.user._id.toString(), socket.id)
        return 'done'
    })
}