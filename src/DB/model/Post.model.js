
import * as dbService from '../db.service.js'
import mongoose, {Schema,model, Types} from "mongoose";
import { commentModel } from './Comment.model.js';

const postShema= new Schema({
    content:{
        type:String,
        minlength:2,
        maxlength:50000,
        trim:true,
        required:function(){
            return this.attachements?.length?false:true
        }
    },
    time:Date,
    isArchive:Boolean,
    attachements:[{secure_url:String,public_id:String}],
    likes:[{type:Types.ObjectId ,ref:'User'}],
    tags:[{type:Types.ObjectId ,ref:'User'}],
    createdBy:{type:Types.ObjectId ,ref:'User',required:true},
    updatedBy:{type:Types.ObjectId ,ref:'User'},
    deletedBy:{type:Types.ObjectId ,ref:'User'},
    isDeleted:Date

},{
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

postShema.post('findOneAndUpdate',{document:false,query:true},async function(doc,next){
    if (doc.isDeleted) {
        await dbService.updateMany({
            model:commentModel,filter:{postId:doc._id},
            data:{
                isDeleted:Date.now(),
                deletedBy:doc.deletedBy,
                updatedBy:doc.updatedBy
            }
        })
    }
    next()
})

postShema.virtual('comment',{
    localField:'_id' ,
    foreignField:'postId',
    ref:'Comment',
    justOne:true // to select the first comment and is not freezed
})

export const  postModel=mongoose.models.Post || model('Post',postShema)