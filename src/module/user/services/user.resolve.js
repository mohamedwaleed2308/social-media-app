import { GraphQLEnumType, GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { userType } from "../types/user.types.js";
import { authentication } from "../../../middleWare/auth.graphQl.middleware.js";
import { tokenTypes } from "../../../utils/security/token.js";

export const userProfile={
    type:new GraphQLObjectType({
        name:'user',
        fields:{
            statusCode:{type:GraphQLInt},
            message:{type:GraphQLString},
            profile:{type:userType}
        }
    }),
    args:{
        token:{type:new GraphQLNonNull(GraphQLString)}
    },
    resolve:async(parent,args)=>{
        const user=await authentication({authorization:args.token,tokenType:tokenTypes.access})
        return {message:'done',statusCode:200,profile:user}
    }
}