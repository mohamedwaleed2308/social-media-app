import { asyncHandler } from "../../../utils/response/error.response.js";
import * as dbService from "../../../DB/db.service.js"
import { chatModel } from "../../../DB/model/Chat.model.js";
import { successResponse } from "../../../utils/response/success.response.js";


export const getChat=asyncHandler(async(req,res , next)=>{

    const {friendId}=req.params
    const chat=await dbService.findOne({
        model:chatModel,
        filter:{
            $or:[
                {
                    mainUser:req.user._id,
                    subParticipant:friendId
                },
                {
                    mainUser: friendId ,
                    subParticipant:req.user._id
                },
            ]
        },
        populate:[
            {
                path:'mainUser',
                select:'firstName lastName image'
            },
            {
                path:'subParticipant',
                select:'firstName lastName image'
            },
            {
                path:'messages.senderId',
                select:'firstName lastName image'
            },
        ]
    })

    return successResponse({res,message:'Done',data:{chat}})
})