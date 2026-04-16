import { GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql'
import * as dbService from '../../../DB/db.service.js'
import { postModel } from '../../../DB/model/Post.model.js'
import { postType } from '../types/post.types.js'


export const postsList = {
    type: new GraphQLObjectType({
        name: "posts",
        fields: {
            message: { type: GraphQLString },
            stautsCode: { type: GraphQLInt },
            data: {
                type: new GraphQLList(postType)
            }
        }
    }),
    resolve: async (parent, args) => {
        const posts = await dbService.find({ model: postModel,
            // populate:[{path:'createdBy'}] 
        })
        return { message: 'Done', stautsCode: 200, data: posts }
    }
}