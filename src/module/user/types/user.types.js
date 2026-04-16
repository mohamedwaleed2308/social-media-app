import { GraphQLBoolean, GraphQLEnumType, GraphQLID, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";
import { genderTypes, providerTypes, roleTypes } from "../../../DB/model/User.model.js";


export const imageType=new GraphQLObjectType({
    name: 'imageType',
    fields: {
        secure_url: { type: GraphQLString },
        public_id: { type: GraphQLString }
    }
})

export const userType=new GraphQLObjectType({
    name:"userType",
    fields:{
        userName:{type:GraphQLString},
        email:{type:GraphQLString},
        tempEmail:{type:GraphQLString},
        updateEmailOtp:{type:GraphQLString},
        emailOtp:{type:GraphQLString},
        otpTime:{type:GraphQLString},
        newEmailOtpTime:{type:GraphQLString},
        password:{type:GraphQLString},
        forgetPasswordOtp:{type:GraphQLString},
        phone:{type:GraphQLString},
        Date:{type:GraphQLString},
        gender:{type:new GraphQLEnumType({
            name:'genderOptions',
            values:{
                male:{value:genderTypes.male},
                female:{value:genderTypes.female},
            }
        })},
        role:{type:new GraphQLEnumType({
            name:'roleOptions',
            values:{
                superAdmin:{value:roleTypes.superAdmin},
                admin:{value:roleTypes.admin},
                user:{value:roleTypes.user},
            }
        })},
        provider:{type:new GraphQLEnumType({
            name:'providerOptions',
            values:{
                system:{value:providerTypes.system},
                google:{value:providerTypes.google},
            }
        })},
        confirmEmail:{type:GraphQLBoolean},
        isDeleted:{type:GraphQLString},
        changeCredentialsTime:{type:GraphQLString},
        viewers:{type:new GraphQLList(new GraphQLObjectType({
            name:"viewerOptions",
            fields:{
                userId:{type:GraphQLID},
            }
        }))},
        friends:{type:new GraphQLList(new GraphQLObjectType({
            name:"friendOptions",
            fields:{
                userId:{type:GraphQLID},
                status:{type:GraphQLString}
            }
        }))},
        blockUsers:{type:new GraphQLList(new GraphQLObjectType({
            name:"blockUsersOptions",
            fields:{
                profileId:{type:GraphQLID},
            }
        }))},
        updatedBy:{type:GraphQLID},
        updatedAt:{type:GraphQLID},
        createdAt:{type:GraphQLID},
        image:{type:imageType},
        coverImages:{type :new GraphQLList(imageType)}
    }
})

export const userList=new GraphQLList(userType)