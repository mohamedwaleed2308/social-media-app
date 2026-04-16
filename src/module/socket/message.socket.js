import { authenticationSocket } from "../../middleWare/auth.socket.middleware.js"
import * as dbService from "../../DB/db.service.js"
import { chatModel } from "../../DB/model/Chat.model.js"
import { socketConnections } from "./socket.service.js"

export const sendMessage = async (socket) => {

    socket.on('sendMessage', async (messageData) => {
        const { data, valid } = await authenticationSocket({ socket })
        if (!valid) {
            return socket.emit('socketError', data)
        }
        const userId = data.user._id
        const { message, destId } = messageData
        console.log({ message, destId, userId });
        let chat = await dbService.findOneAndUpdate({
            model: chatModel,
            filter: {
                $or: [
                    {
                        mainUser: userId,
                        subParticipant: destId
                    },
                    {
                        mainUser: destId,
                        subParticipant: userId
                    },
                ]
            },
            data:{
                $push:{messages:[{message,senderId:userId}]}
            },
            populate: [
                {
                    path: 'mainUser',
                    select: 'firstName lastName image'
                },
                {
                    path: 'subParticipant',
                    select: 'firstName lastName image'
                },
                {
                    path: 'messages.senderId',
                    select: 'firstName lastName image'
                },
            ]
        })
        if (!chat) {
            let chat = await dbService.create({
                model: chatModel,
                data:{
                    mainUser:userId,
                    subParticipant:destId,
                    messages:[{message,senderId:userId}]
                }
            })
        }
        socket.emit('successMessage',{chat,message})
        socket.to(socketConnections.get(destId)).emit('receiveMessage',{message})

        return 'Done'

    })

}