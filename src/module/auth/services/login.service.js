import { providerTypes, roleTypes, userModel } from "../../../DB/model/User.model.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { compareHash, generateHash } from "../../../utils/security/hash.js";
import { decodeToken, generateToken, tokenTypes } from "../../../utils/security/token.js";
import { OAuth2Client } from 'google-auth-library';
import * as dbService from '../../../DB/db.service.js'
import { emailEvent } from "../../../utils/events/email.event.js";

export const login = asyncHandler(
  async (req, res, next) => {
    const { email, password } = req.body;

    // const { action } = req.params;
    const user = await dbService.findOne({ model: userModel, filter: { email, isDeleted: { $exists: false } } });
    if (!user) {
      return next(new Error('user not found', { cause: 404 }))
    }
    if (user?.provider != providerTypes.system) {
      return next(new Error('you are not allow to login here'))
    }
    if (!user.confirmEmail) {
      return next(new Error('please confirm your Email first'))
    }
    if (!compareHash({ plainText: password, hashValue: user.password })) {
      return next(new Error('email or password not correct', { cause: 401 }))
    }


    const accessToken = generateToken({ payload: { id: user._id }, signature: [ roleTypes.admin, roleTypes.superAdmin ].includes(user.role) ? process.env.system_access_token : process.env.user_access_token })
    const refreshToken = generateToken({ payload: { id: user._id }, signature: [ roleTypes.admin, roleTypes.superAdmin ].includes(user.role) ? process.env.system_refresh_token : process.env.user_refresh_token })
    return successResponse({ res, message: 'Done', status: 200, data: { token: { accessToken, refreshToken } } })
  }
)


export const loginWithGmail = asyncHandler(
  async (req, res, next) => {
    const { idToken } = req.body;
    const client = new OAuth2Client();
    async function verify() {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.CLIENT_ID,  // Specify the WEB_CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[WEB_CLIENT_ID_1, WEB_CLIENT_ID_2, WEB_CLIENT_ID_3]
      });
      const payload = ticket.getPayload();
      return payload
      // If the request specified a Google Workspace domain:
      // const domain = payload['hd'];
    }
    const payload = await verify()
    if (!payload) {
      return next(new Error('in-valid payload', { cause: 400 }))
    }
    if (!payload.email_verified) {
      return next(new Error('you are not auth'))
    }
    let user = await dbService.findOne({ model: userModel, filter: { email: payload.email } })
    if (!user) {
      user = await dbService.create({
        model: userModel, data: {
          email: payload.email,
          userName: payload.name,
          provider: providerTypes.google
        }
      })
    } else if (user?.provider != providerTypes.google) {
      return next(new Error('not allow to login here'))
    }
    const accessToken = generateToken({ payload: { id: user._id }, signature: [ roleTypes.admin, roleTypes.superAdmin ].includes(user.role) ? process.env.system_access_token : process.env.user_access_token })
    const refreshToken = generateToken({ payload: { id: user._id }, signature: [ roleTypes.admin, roleTypes.superAdmin ].includes(user.role) ? process.env.system_refresh_token : process.env.user_refresh_token })
    return successResponse({
      res, message: 'Done', status: 200,
      data:
      {
        token: { accessToken, refreshToken },
        // payload
      }

    })
  }
)

export const twoStepVerification = asyncHandler(
  async (req, res, next) => {
    const { email, code } = req.body;
    const user = await dbService.findOne({ model: userModel, filter: { email, isDeleted: { $exists: false } } });
    if (!user) {
      return next(new Error('user not found', { cause: 404 }))
    }
    if (!user.confirmEmail) {
      return next(new Error('please confirm your Email first'))
    }
    if (!compareHash({ plainText: code, hashValue: user.emailOtp })) {
      return next(new Error('in-valid verification code', { cause: 401 }))
    }
    const accessToken = generateToken({ payload: { id: user._id }, signature: [ roleTypes.admin, roleTypes.superAdmin ].includes(user.role) ? process.env.system_access_token : process.env.user_access_token })
    const refreshToken = generateToken({ payload: { id: user._id }, signature: [ roleTypes.admin, roleTypes.superAdmin ].includes(user.role) ? process.env.system_refresh_token : process.env.user_refresh_token })
    return successResponse({ res, message: 'login Done', status: 200, data: { accessToken, refreshToken } })
  }
)
// export const loginPhone = asyncHandler(
//     async (req, res, next) => {
//         const { phone,password } = req.body;
//         // const user = await userModel.findOne({ phone });
//         const user = await dbService.findOne({model:userModel,filter:{email}})
//         if (!user) {
//             return next(new Error('user not found', { cause: 404 }))
//         }
//         if (!user.confirmEmail) {
//             return next(new Error('please confirm your Email first'))
//         }
//         if (!compareHash({plainText:password,hashValue:user.password})) {
//             return next(new Error('phone or password not correct',{cause:401}))
//         }

//         const accessToken = generateToken({ payload: { id: user._id }, signature: user.role === 'admin' ? process.env.system_access_token : process.env.user_access_token })
//         const refreshToken = generateToken({ payload: { id: user._id }, signature: user.role === 'admin' ? process.env.system_refresh_token : process.env.user_refresh_token })
//         return successResponse({ res, message: 'login Done', status: 200, data: { accessToken, refreshToken } })
//     }
// )



//////
// export const loginWithGmail = asyncHandler(
//     async (req, res, next) => {
//         const { idToken } = req.body;
//         const client = new OAuth2Client();
//         async function verify() {
//             const ticket = await client.verifyIdToken({
//                 idToken,
//                 audience: process.env.CLIENT_ID,
//             });
//             const payload = ticket.getPayload();
//             return payload;

//         }
//         const gmailData = await verify()
//         const { email_verified, name, email, picture } = gmailData;
//         if (!email_verified) {
//             return next(new Error('in-valid account', { cause: 400 }))
//         }
//         // let user=await userModel.findOne({email})
//         const user = await dbService.findOne({ model: userModel, filter: { email } })
//         if (user?.provider === providerTypes.system) {
//             return next(new Error('In-vlaid login provider', { cause: 409 }))
//         }
//         if (!user) {
//             user = await userModel.create({ userName: name, email, confirmEamil: email_verified, image: picture, provider: providerTypes.google })
//         }
//         const accessToken = generateToken({ payload: { id: user._id }, signature: [roleTypes.admin, roleTypes.superAdmin].includes(user.role) ? process.env.system_access_token : process.env.user_access_token })
//         const refreshToken = generateToken({ payload: { id: user._id }, signature: [roleTypes.admin, roleTypes.superAdmin].includes(user.role) ? process.env.system_refresh_token : process.env.user_refresh_token })
//         return successResponse({ res, message: 'login Done', status: 200, data: { accessToken, refreshToken } })
//     }
// )

export const refreshToken = asyncHandler(
  async (req, res, next) => {
    const user = await decodeToken({ authorization: req.headers.authorization, tokenType: tokenTypes.refresh })
    const accessToken = generateToken({ payload: { id: user._id }, signature: user.role === 'admin' ? process.env.system_access_token : process.env.user_access_token })
    const refreshToken = generateToken({ payload: { id: user._id }, signature: user.role === 'admin' ? process.env.system_refresh_token : process.env.user_refresh_token })
    return successResponse({ res, message: 'login Done', status: 200, data: { accessToken, refreshToken } })
  }
)



export const forgetPassword = asyncHandler(
  async (req, res, next) => {
    const { email } = req.body;
    // const user = await userModel.findOne({ email, isdeleted: false });
    const user = await dbService.findOne({ model: userModel, filter: { email, isDeleted: { $exists: false } } })
    if (!user) {
      return next(new Error('user not found', { cause: 404 }))
    }

    emailEvent.emit('forgetPassword', { id: user._id, email })
    await userModel.updateOne({ email }, { otpTime: Date.now() })
    return successResponse({ res })
  }
)
export const resetPassword = asyncHandler(
  async (req, res, next) => {
    const { email, code, password } = req.body;
    // const user = await userModel.findOne({ email, isdeleted: false });
    const user = await dbService.findOne({ model: userModel, filter: { email, isDeleted: { $exists: false } } })
    if (parseInt((Date.now() - user.otpTime) / 1000) >= 120) {
      return next(new Error('code is expired', { cause: 409 }))
    }
    if (!user) {
      return next(new Error('user not found', { cause: 404 }))
    }
    if (!compareHash({ plainText: code, hashValue: user.forgetPasswordOtp })) {
      return next(new Error('in-valid code', { cause: 400 }))
    }
    const hashPassword = generateHash({ plainText: password })
    await userModel.updateOne({ email }, { password: hashPassword, confirmEmail: true, changeCredentialsTime: Date.now(), $unset: { forgetPasswordOtp: 0, otp: 0, otpTime: 0 } })

    return successResponse({ res })
  }
)
