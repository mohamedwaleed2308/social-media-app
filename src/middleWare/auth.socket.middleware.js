import { asyncHandler } from "../utils/response/error.response.js";
import { decodeToken, tokenTypes, verifyToken } from "../utils/security/token.js";
import * as dbService from '../DB/db.service.js'
import { userModel } from "../DB/model/User.model.js";


export const authenticationSocket = async({socket,tokenType=tokenTypes.access}) => {
    
        const [Bearer, token] = socket?.handshake?.auth?.authorization?.split(" ") || []
        // socket.handshake.auth.authorization
        if (!Bearer || !token) {
            return {data:{message:'authorization is required',status:400}}
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
        // const tokenn=
        const decoded = verifyToken({ token, signature: tokenType === tokenTypes.access ? accessSignature : refreshSignature })
        
        if (!decoded.id) {
            return {data:{message:'in-valid payload',status:400}}

        }
        const user = await dbService.findOne({ model: userModel, filter: { _id: decoded.id, isDeleted:{$exists:false} } })
        
        if (!user) {
            return {data:{message:'user not found',status:400}}


        }
        if (user.changeCredentialsTime?.getTime() >= decoded.iat * 1000) {
            return {data:{message:'In-valid Credentials',status:400}}

        }
        return {data:{user},valid:true};
}

