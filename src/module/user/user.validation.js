import joi from "joi";
import { globalFields } from "../globalFields.js";
import { roleTypes } from "../../DB/model/User.model.js";


export const shareProfile = joi.object().keys({
    profileId: globalFields.id.required()
}).required()

export const blockUser = joi.object().keys({
    profileId: globalFields.id.required(),
    status: joi.string().valid('block', 'unblock')
}).required()

export const changeRoles = joi.object().keys({
    userId: globalFields.id.required(),
    role: joi.string().valid(roleTypes.admin, roleTypes.superAdmin)
}).required()


export const updateProfile = joi.object().keys({
    userName: globalFields.userName,
    phone: globalFields.phone,
    gender: globalFields.gender,
    DOB: globalFields.DOB
}).required()


export const updatePassword = joi.object().keys({
    oldPassword: globalFields.password.required(),
    password: globalFields.password.not(joi.ref('oldPassword')).required(),
    confirmPassword: globalFields.password.required()
}).required()
export const updateEmail = joi.object().keys({
    email: globalFields.email.required()
}).required()
export const replaceEmail = joi.object().keys({
    code: globalFields.code.required(),
    oldEmailCode: globalFields.code.required()
}).required()



export const addFriend = joi.object().keys({
    friendId: globalFields.id.required()
}).required()

export const acceptFriend = joi.object().keys({
    friendRequestId: globalFields.id.required(),
    status: joi.string().valid('accept', 'reject')
}).required()