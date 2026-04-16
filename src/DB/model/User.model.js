import mongoose, { model, Schema, Types } from "mongoose";
import { postModel } from "./Post.model.js";

export const genderTypes={male:'male',female:'female'}
export const roleTypes={user:'user',admin:'admin',superAdmin:'superAdmin'}
export const providerTypes={system:'system',google:'google'}


const userSchema=new Schema({
    userName:{
        type:String,
        required:true,
        minlength:2,
        maxlength:25,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    tempEmail:{
        type:String,
    },
    updateEmailOtp:String,
    emailOtp:String,
    otpTime:Date,
    newEmailOtpTime:Date,

    password:{
        type:String
    },
    forgetPasswordOtp:String,

    phone:String,
    DOB:Date,
    image:{secure_url:String,public_id:String},
    video:{secure_url:String,public_id:String},
    coverImages:[{secure_url:String,public_id:String}],
    gender:{
        type:String,
        enum:Object.values(genderTypes),
        default:genderTypes.male
    },
    role:{
        type:String,
        enum:Object.values(roleTypes),
        default:roleTypes.user
    },
    provider:{
        type:String,
        enum:Object.values(providerTypes),
        default:providerTypes.system
    },
    confirmEmail:{
        type:Boolean,
        default:false
    },
    
    isDeleted:Date,
    changeCredentialsTime:Date,
    viewers:[{userId:{type:Types.ObjectId,ref:'User'},time:[{type:Date}]}],
    friends:[{type:Types.ObjectId,ref:'User'}],
    blockUsers:[{profileId:{type:Types.ObjectId,ref:'User'},time:{type:Date}}],
    updatedBy:{type:Types.ObjectId,ref:'User'}
},{timestamps:true})

userSchema.post('deleteOne',{document:true,query:false},async function(doc,next){
    await postModel.deleteMany({createdBy:this._id})
    next()
})

export const userModel=mongoose.models.User || model('User', userSchema)
