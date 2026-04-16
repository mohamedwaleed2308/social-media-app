import { userModel } from "../../../DB/model/User.model.js";
import { emailEvent } from "../../../utils/events/email.event.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { compareHash, generateHash } from "../../../utils/security/hash.js";
import * as dbService from '../../../DB/db.service.js'

export const signup = asyncHandler(
    async (req, res, next) => {
        const { userName, email, password, phone } = req.body;
        if (await dbService.findOne({ model: userModel, filter: { email } })) {
            return next(new Error('Email Exist', { cause: 409 }))
        };
        const hashPassword = generateHash({ plainText: password });
        const user = await dbService.create({ model: userModel, data: { userName, email, phone, password: hashPassword } })
        emailEvent.emit('confirmEmail', { email, id: user._id });
        await dbService.updateOne({ model: userModel, filter: { id: user._id, email }, data: { otpTime: Date.now() } })
        return successResponse({ res, message: 'Signup Done', status: 201, data: { user } })
    }
)

export const confirmEmail = asyncHandler(
    async (req, res, next) => {
        const { email, code } = req.body;
        const findUser = await dbService.findOne({ model: userModel, filter: { email } });
        if (parseInt((Date.now() - findUser.otpTime) / 1000) >= 120) {
            return next(new Error('code is expired', { cause: 409 }))
        }
        if (!findUser) {
            return next(new Error('user is not found', { cause: 404 }))
        }
        if (findUser.confirmEmail) {
            return next(new Error('Already confirmed', { cause: 409 }))
        }
        if (!compareHash({ plainText: code, hashValue: findUser.emailOtp })) {
            return next(new Error('in-valid code', { cause: 400 }))
        }
        // const user=await userModel.findOneAndUpdate({email},{confirmEmail:true,$unset:{otp:0}},{new:true})
        const user = await dbService.findOneAndUpdate({ model: userModel, filter: { email }, data: { confirmEmail: true, $unset: { emailOtp: 0 } }, options: { new: true } })


        return successResponse({ res, message: 'confirm Done', status: 201, data: { user } })
    }
)