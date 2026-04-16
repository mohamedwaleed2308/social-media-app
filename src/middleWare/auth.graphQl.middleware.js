import { userModel } from "../DB/model/User.model.js"
import { tokenTypes, verifyToken } from "../utils/security/token.js"
import * as dbService from '../DB/db.service.js'


export const authentication = async ({ authorization = "", tokenType = tokenTypes.access } = {}) => {
    // req.user = await decodeToken({ authorization: req.headers.authorization, next })
    const [ Bearer, token ] = authorization?.split(" ") || []
    if (!Bearer || !token) {
        throw new Error('authorization is required')
        // return next(new Error('authorization is required', { cause: 400 }))
    }
    let accessSignature = ''
    let refreshSignature = ''
    switch (Bearer) {
        case 'system':
            accessSignature = process.env.system_access_token
            refreshSignature = process.env.system_refresh_token
            break;
        case 'Bearer':
            accessSignature = process.env.user_access_token
            refreshSignature = process.env.user_refresh_token
            break;
        default:
            break;
    }
    const decoded = verifyToken({ token, signature: tokenType === tokenTypes.access ? accessSignature : refreshSignature })

    if (!decoded.id) {
        throw new Error('in-valid payload')
        // return next(new Error('in-valid payload', { cause: 401 }))
    }
    const user = await dbService.findOne({ model: userModel, filter: { _id: decoded.id, isDeleted: { $exists: false } } })
    if (!user) {
        throw new Error('user not found')
        // return next(new Error('user not found', { cause: 404 }))
    }
    if (user.changeCredentialsTime?.getTime() >= decoded.iat * 1000) {
        throw new Error('In-valid Credentials')
        // return next(new Error('In-valid Credentials', { cause: 400 }))
    }
    return user;

}
export const authorization = async ({ accessRoles = [], role }) => {
    if (!accessRoles.includes(role)) {
        throw new Error('not authorized account')

        // return next(new Error('not authorized account', { cause: 400 }))
    }
    return true;
}