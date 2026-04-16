import { GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql'
import { imageType, userType } from '../../user/types/user.types.js'
import * as dbService from '../../../DB/db.service.js'
import { userModel } from '../../../DB/model/User.model.js'

export const postType=new GraphQLObjectType({
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
})

