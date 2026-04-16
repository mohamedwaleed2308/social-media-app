import { asyncHandler } from "../utils/response/error.response.js";
import { decodeToken } from "../utils/security/token.js";


// export const authentication=()=>{
//     return asyncHandler(async(req , res , next)=>{
//         const { authorization } = req.headers;
//                 const [Bearer, token] = authorization?.split(" ") || []
//                 if (!Bearer || !token) {
//                     return next(new Error('authorization is required', { cause: 400 }))
//                 }
//                 let signature = undefined
//                 switch (Bearer) {
//                     case 'system':
//                         signature = process.env.system_refresh_token
//                         break;
//                     case 'Bearer':
//                         signature = process.env.user_refresh_token
//                         break;

//                     default:
//                         break;
//                 }
//                 const decoded = verifyToken({ token, signature })
//                 if (!decoded.id) {
//                     return next(new Error('in-valid payload', { cause: 401 }))
//                 }
//                 // const user = await userModel.findOne({ _id: decoded.id });
//                 const user = await dbService.findOne({model:userModel,filter:{_id:decoded.id}})
//                 if (!user) {
//                     return next(new Error('user not found', { cause: 404 }))
//                 }
//     })
// }
export const authentication = () => {
    return asyncHandler(async (req, res, next) => {
        req.user = await decodeToken({ authorization: req.headers.authorization, next })
        return next()
    })
}
export const authorization = (accessRoles = []) => {
    return asyncHandler(async (req, res, next) => {
        if (!accessRoles.includes(req.user.role)) {
            return next(new Error('not authorized account', { cause: 400 }))
        }
        return next()
    })
}

