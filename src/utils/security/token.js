import jwt from "jsonwebtoken";
import * as dbService from "../../DB/db.service.js"
import { userModel } from "../../DB/model/User.model.js";

export const tokenTypes = {
    access: 'access',
    refresh: 'refresh'
}
export const decodeToken = async ({ authorization,next, tokenType = tokenTypes.access } = {}) => {
    const [Bearer, token] = authorization?.split(" ") || []
    if (!Bearer || !token) {
        return next(new Error('authorization is required', { cause: 400 }))
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
        return next(new Error('in-valid payload', { cause: 401 }))
    }
    const user = await dbService.findOne({ model: userModel, filter: { _id: decoded.id, isDeleted:{$exists:false} } })
    if (!user) {
        return next(new Error('user not found', { cause: 404 }))
    }
    if (user.changeCredentialsTime?.getTime() >= decoded.iat * 1000) {
        return next(new Error('In-valid Credentials', { cause: 400 }))
    }
    return user;
}


export const generateToken = ({ payload = {}, signature, expiresIn = 18000 } = {}) => {
    const token = jwt.sign(payload, signature, { expiresIn: parseInt(expiresIn) })
    return token;
}


export const verifyToken = ({ token, signature } = {}) => {
    const decoded = jwt.verify(token, signature)
    return decoded;
}