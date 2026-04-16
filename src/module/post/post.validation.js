import joi from 'joi'
import { globalFields } from '../globalFields.js'

export const createPost = joi.object().keys({
    content: joi.string().min(2).max(50000).trim()
})
export const updatePost = joi.object().keys({
    postId: globalFields.id.required()
}).required()
// export const createPost=joi.object().keys({
//     content:joi.string().min(2).max(50000).trim(),
//     attachement:globalFields.attachement
// }).or('content','attachement')

export const freezePost = joi.object().keys({
    postId: globalFields.id.required()
}).required()


export const likePost = joi.object().keys({
    action: joi.string().valid('like', 'unlike'),
    postId: globalFields.id.required()
}).required()
export const likePostGraphQl = joi.object().keys({
    action: joi.string().valid('like', 'unlike'),
    postId: globalFields.id.required(),
    token:joi.string().required()
}).required()

export const archivePost = joi.object().keys({
    postId: globalFields.id.required()
}).required()