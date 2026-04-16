import { GraphQLBoolean, GraphQLEnumType, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql'
import * as dbService from '../../../DB/db.service.js'
import { postModel } from '../../../DB/model/Post.model.js'
import { postType } from '../types/post.types.js'
import { authentication, authorization } from '../../../middleWare/auth.graphQl.middleware.js'
import { tokenTypes } from '../../../utils/security/token.js'
import { roleTypes } from '../../../DB/model/User.model.js'
import { validationGraphQl } from '../../../middleWare/validation.middleWare.js'
import { likePostGraphQl } from '../post.validation.js'


export const likePost = {
    type: new GraphQLObjectType({
        name: "likePosts",
        fields: {
            message: { type: GraphQLString },
            stautsCode: { type: GraphQLInt },
            data: {
                type: postType
            }
        }
    }),
    args: {
        postId: { type: new GraphQLNonNull(GraphQLID) },
        token: { type: new GraphQLNonNull(GraphQLString) },
        action: {
            type: new GraphQLNonNull(new GraphQLEnumType({
                name: 'likeAction',
                values: {
                    like: { value: 'like' },
                    unlike: { value: 'unlike' },
                }
            }))
        }
    },
    resolve: async (parent, args) => {
        const { postId, token, action } = args
        
        await validationGraphQl({schema:likePostGraphQl,args})
        const user = await authentication({ authorization: token, tokenType: tokenTypes.access })
        await authorization({ accessRoles: Object.values(roleTypes), role: user.role })
        const data = action === 'unlike' ? { $pull: { likes: user._id } } : { $addToSet: { likes: user._id } }
        const post = await dbService.findOneAndUpdate({
            model: postModel,
            filter: {
                _id: postId,
                isDeleted:{ $exists: false }
            },
            data,
            options: { new: true }
        })
        
        return { message: 'Done', stautsCode: 200, data: post }
    }
}