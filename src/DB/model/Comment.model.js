

import mongoose, {Schema,model, Types} from "mongoose";

const commentShema= new Schema({
    content:{
        type:String,
        minlength:2,
        maxlength:50000,
        trim:true,
        required:function(){
            return this.attachements?.length?false:true
        }
    },
    attachements:[{secure_url:String,public_id:String}],
    postId:{type:Types.ObjectId,ref:'Post',required:true},
    commentId:{type:Types.ObjectId ,ref:'Comment'},
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

commentShema.virtual('reply',{
    localField:'_id',
    foreignField:'commentId',
    ref:'Comment'
})

export const  commentModel =mongoose.models.Comment || model('Comment',commentShema)