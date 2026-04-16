import * as mutationResolver from "./post/services/mutation.resolver.js";
import * as queryResolver from "./post/services/query.resolver.js";
import * as userResolver from "./user/services/user.resolve.js";
import { GraphQLObjectType, GraphQLSchema } from 'graphql'


export const schemaPosts = new GraphQLSchema({
    query:new GraphQLObjectType({
        name:'queryPosts',
        description:'this query get posts',
        fields:{
            ...queryResolver,
            ...userResolver
        }
    }),
    mutation:new GraphQLObjectType({
        name:'mutation',
        fields:{
            ...mutationResolver
        }
    })

})

export const schemaPost = new GraphQLSchema({
    query:new GraphQLObjectType({
        name:'',
        description:'',
        fields:{
            postsList : {
                type: new GraphQLObjectType({
                    name: "posts",
                    fields: {
                        message: { type: GraphQLString },
                        stautsCode: { type: GraphQLInt },
                        data: {
                            type: new GraphQLList(new GraphQLObjectType({
                                name: "attachementsofposts",
                                fields: {
                                    _id: { type: GraphQLID },
                                    content: { type: GraphQLString },
                                    attachements: {
                                        type: new GraphQLList(imageType)
                                    },
                                    likes: { type: new GraphQLList(GraphQLID) },
                                    tags: { type: new GraphQLList(GraphQLID) },
                                    isDeleted: { type: GraphQLString },
                                    createdBy: { type: GraphQLID },
                                    createdByInfo: { 
                                        type: userType ,
                                        resolve:async(parent,args)=>{
                                            console.log(parent.createdBy.toString());
                                            
                                            return await dbService.findOne({model:userModel,filter:{_id:parent.createdBy.toString()}})
                                        }
                                    },
                                    createdAt: { type: GraphQLString },
                                    updatedBy: { type: GraphQLID },
                                    updatedAt: { type: GraphQLString },
                                    deletedBy: { type: GraphQLID },
                                    isArchive: { type: GraphQLBoolean },
                                }
                            }))
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
        }
    }),
    mutation:new GraphQLObjectType({
        name:'',
        description:'',
        fields:{}
    })
})
