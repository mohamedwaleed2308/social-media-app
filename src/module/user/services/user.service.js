import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../DB/db.service.js"
import { roleTypes, userModel } from "../../../DB/model/User.model.js";
import { compareHash, generateHash } from "../../../utils/security/hash.js";
import { emailEvent } from "../../../utils/events/email.event.js";
import { cloud } from "../../../utils/multer/cloudinary.multer.js";
import { postModel } from "../../../DB/model/Post.model.js";
import { friendRequestModel } from "../../../DB/model/FriendRequest.model.js";


export const profile = asyncHandler(
    async (req, res, next) => {
        const user = await dbService.findById({
            model: userModel, id: req.user._id,
            populate: [
                { path: 'viewers.userId', select: 'userName email image' },
                {path:'friends',select:"userName _id image"}
            ]
        })
        return successResponse({ res, message: 'done', data: { user } })
    }
)

export const changeRoles = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const { role } = req.body;
    const roles = req.user.role === roleTypes.superAdmin ? { role: { $nin: [roleTypes.superAdmin] } } :
        { role: { $nin: [roleTypes.admin, roleTypes.superAdmin] } }
    const user = await dbService.findOneAndUpdate({
        model: userModel,
        filter: {
            _id: userId,
            ...roles
        },
        data: {
            role,
            updatedBy: req.user._id
        },
        options: {
            new: true
        }
    })
    return successResponse({ res, message: 'role changed', data: { user } })
}
)

export const dashboard = asyncHandler(
    async (req, res, next) => {
        const results = await Promise.allSettled([
            await dbService.find({
                model: userModel,
            }),
            await dbService.find({
                model: postModel,
            })
        ])
        // const users = await dbService.find({
        //     model: userModel, 
        // })
        // const posts = await dbService.find({
        //     model: postModel, 
        // })
        return successResponse({ res, message: 'done', data: { results } })
    }
)
export const shareProfile = asyncHandler(
    async (req, res, next) => {

        const usersBlocked = [];
        const usersBlocked2 = [];
        const checkUser = ({ list, type = 'findUser' } = {}) => {
            list?.filter((user) => {
                type === 'findUser' ? usersBlocked.push(user.profileId.toString()) :
                    usersBlocked2.push(user.profileId.toString())
            })
        }
        const { profileId } = req.params;
        const findUser = await dbService.findOne({
            model: userModel, filter: { _id: profileId, isDeleted: { $exists: false } }
        })
        const findUser2 = await dbService.findOne({
            model: userModel,
            filter: { _id: req.user._id, isDelete: { $exists: false }, blockUsers: { $exists: true } }
        })
        if (!findUser) {
            return next(new Error('In-valid profileId', { cause: 400 }))
        }

        checkUser({ list: findUser?.blockUsers, type: 'findUser' })
        if (usersBlocked.includes(req.user._id.toString())) {
            return successResponse({ res, message: "you are blocked from user you are search" })
        }


        checkUser({ list: findUser2?.blockUsers, type: 'findUser2' })
        if (usersBlocked2.includes(profileId.toString())) {
            return successResponse({ res, message: 'you are block this account' })
        }

        const viewers = findUser.viewers
        const usersId = [];
        viewers.filter(viewer => {
            usersId.push(viewer.userId.toString())
        })
        // if (usersId.length>=5) {
        //     await dbService.updateOne({
        //         model: userModel, filter: { _id: profileId }, data: {
        //             $pop:{viewers:-1}
        //         }
        //     })
        // }
        if (!usersId.includes(req.user._id.toString())) {
            if (profileId != req.user._id.toString()) {
                await dbService.updateOne({
                    model: userModel, filter: { _id: profileId }, data: {
                        $push: { viewers: { $each: [{ userId: req.user._id, time: Date.now() }], $slice: -5 } }
                    }
                })
            }
        }
        const user = await dbService.findOne({
            model: userModel, filter: { _id: profileId, isDeleted: { $exists: false } },
            select: " userName email phone DOB image "
        })

        return successResponse({ res, message: 'done', data: { user } })
    }
)
export const updateProfile = asyncHandler(
    async (req, res, next) => {
        await dbService.updateOne({
            model: userModel, filter: { _id: req.user._id }, data: req.body
        })

        return successResponse({ res, message: 'profile is updated' })
    }
)
export const updatePassword = asyncHandler(
    async (req, res, next) => {
        const { oldPassword, password } = req.body;
        if (!compareHash({ plainText: oldPassword, hashValue: req.user.password })) {
            return next(new Error('in-valid old password', { cause: 400 }))
        }

        await dbService.updateOne({
            model: userModel, filter: { _id: req.user._id }, data: {
                password: generateHash({ plainText: password }),
                changeCredentialsTime: Date.now()
            }
        })

        return successResponse({ res, message: 'password is updated' })
    }
)
export const updateEmail = asyncHandler(
    async (req, res, next) => {
        const { email } = req.body;
        if (await dbService.findOne({ model: userModel, filter: { email } })) {
            return next(new Error('Email Exist', { cause: 409 }))
        }
        await dbService.updateOne({
            model: userModel,
            filter: { _id: req.user._id },
            data: { tempEmail: email }
        })

        emailEvent.emit('updateEmail', { id: req.user._id, email })
        emailEvent.emit('confirmEmail', { id: req.user._id, email: req.user.email })
        return successResponse({ res, message: 'Done' })
    }
)
export const replaceEmail = asyncHandler(
    async (req, res, next) => {
        const { code, oldEmailCode } = req.body;
        // because the code of old email and new email was saved in same time
        if (parseInt((Date.now() - req.user.otpTime) / 1000) >= 120) {
            return next(new Error('code is expired ', { cause: 409 }))
        }
        if (await dbService.findOne({ model: userModel, filter: { email: req.user.tempEmail } })) {
            return next(new Error('Email Exist', { cause: 409 }))
        }
        if (!compareHash({ plainText: code, hashValue: req.user.updateEmailOtp })) {
            return next(new Error('you must provide your verification code for new Email'))
        }
        if (!compareHash({ plainText: oldEmailCode, hashValue: req.user.emailOtp })) {
            return next(new Error('you must provide your verification code for old Email'))
        }

        await dbService.updateOne({
            model: userModel,
            filter: { _id: req.user._id },
            data: {
                email: req.user.tempEmail,
                changeCredentialsTime: Date.now(),
                $unset: {
                    tempEmail: 0,
                    emailOtp: 0,
                    updateEmailOtp: 0,
                    otpTime: 0,
                    newEmailOtpTime: 0
                }
            },

        })

        return successResponse({ res, message: 'email is updated' })
    }
)
// using multer to upload image and files
export const uploadImage = asyncHandler(
    async (req, res, next) => {
        const { secure_url, public_id } = await cloud.uploader.upload(req.file.path, {
            folder: `${process.env.appName}/user/${req.user._id}/profile`
        })
        const user = await dbService.findByIdAndUpdate({
            model: userModel,
            id: req.user._id,
            data: {
                image: { secure_url, public_id }
            },
            options: {
                new: false
            }
        })
        if (user.image?.public_id) {
            await cloud.uploader.destroy(user.image.public_id);
        }
        return successResponse({ res, message: 'image is uploaded', data: { user, file: req.file } })

    }
)
// export const uploadVideo = asyncHandler(
//     async (req, res, next) => {
//         // const {secure_url,public_id} = await cloud.uploader.upload_stream(req.file.path,{
//         //     folder:`${process.env.appName}/user/${req.user._id}/profile/video`
//         // })
//         // const user=await dbService.findByIdAndUpdate({
//         //     model:userModel,
//         //     id:req.user._id,
//         //     data:{
//         //         video:{secure_url,public_id}
//         //     },
//         //     options:{
//         //         new:false
//         //     }
//         // }) 
//         // if (user.image?.public_id) {
//         //     await cloud.uploader.destroy(user.image.public_id);
//         // }
//         return successResponse({ res, message: 'image is uploaded',data:{file:req.file} })

//     }
// )
export const coverImages = asyncHandler(
    async (req, res, next) => {
        let images = []
        for (const file of req.files) {
            const { secure_url, public_id } = await cloud.uploader.upload(file.path, {
                folder: `${process.env.appName}/user/${req.user._id}/profile/cover`
            });
            images.push({ secure_url, public_id });
        }
        const user = await dbService.findByIdAndUpdate({
            model: userModel,
            id: req.user._id,
            data: {
                coverImages: images
            },
            options: {
                new: true
            }
        });
        return successResponse({ res, message: 'images is uploaded', data: { user } });
    }
)
export const identity = asyncHandler(
    async (req, res, next) => {
        // const user=await dbService.findByIdAndUpdate({
        //     model:userModel,
        //     id:req.user._id,
        //     data:{
        //         coverImages:req.files.map(file=>file.finalPath)
        //     },
        //     options:{
        //         new:true
        //     } 
        // })
        return successResponse({ res, message: 'image is uploaded', data: { files: req.files } })
    }
)

// Block User
export const blockUser = asyncHandler(async (req, res, next) => {
    const { profileId, status } = req.params;
    if (!await dbService.findOne({ model: userModel, filter: { _id: profileId, isDeleted: { $exists: false } } })) {
        return next(new Error('in-valid profileId', { cause: 404 }))
    }
    const data = status === 'block' ? { $addToSet: { blockUsers: { profileId, time: Date.now() } } } : { $pull: { blockUsers: { profileId } } }
    await dbService.findOneAndUpdate({
        model: userModel,
        filter: { _id: req.user._id, isDelete: { $exists: false } },
        data
    })
    return successResponse({ res, message: status == 'block' ? 'user is Blocked' : 'user is unBlocked', status: 200 })
})

// add friend
export const addFriendRequest = asyncHandler(async (req, res, next) => {
    const { friendId } = req.params;
    const checkUser = await dbService.findOne({
        model: userModel,
        filter: { _id: friendId, isDeleted: { $exists: false } }
    })
    if (!checkUser) {
        return next(new Error('Not Found', { cause: 404 }))
    }
    const addFriend = await dbService.create({
        model: friendRequestModel,
        data: {
            friendId,
            createdBy: req.user._id
        }
    })
    return successResponse({ res, status: 201, message: 'request sent' })
})

export const acceptFriend = asyncHandler(async (req, res, next) => {
    const { friendRequestId, status } = req.params;
    const checkRequest = await dbService.findOne({
        model: friendRequestModel,
        filter: {
            _id:friendRequestId,
            friendId: req.user._id,
            status: false
        }
    })
    if (!checkRequest) {
        return next(new Error('not have any friendRequest'))
    }
    if (status == 'reject') {
        await dbService.findOneAndDelete({
            model: friendRequestModel,
            filter: { _id: friendRequestId }
        })
    } else {

        await dbService.findOneAndUpdate({
            model: userModel,
            filter: { _id: req.user._id },
            data: {
                $addToSet:{friends: checkRequest.createdBy}
            }
        })
        await dbService.findOneAndUpdate({
            model: userModel,
            filter: { _id: checkRequest.createdBy },
            data: {
                $addToSet:{friends: req.user._id}
            }
        })
        await dbService.findOneAndDelete({
            model: friendRequestModel,
            filter: { _id: friendRequestId }
        })
    }
    return successResponse({ res, status: 200, message:status=='accept'? 'accepted':'rejected' })
})



// const user = await dbService.findOne({ model: userModel, filter: { _id: userId, isDeleted: { $exists: false } } })
// if (!user) {
//     return next(new Error('in-valid profileId', { cause: 404 }))
// }
// await Promise.allSettled([
//     await dbService.findOneAndUpdate({
//         model: userModel, filter: { _id: req.user._id, isDeleted: { $exists: false } },
//         data: { $addToSet: { friends: { userId } } }
//     }),
//     await dbService.findOneAndUpdate({
//         model: userModel, filter: { _id: userId, isDeleted: { $exists: false } },
//         data: { $addToSet: { friends: { userId: req.user._id } } }
//     }),
// ])
// return successResponse({ res, message: 'request is sent', status: 200 })