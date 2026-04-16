import joi from 'joi'
import { globalFields } from '../globalFields.js'


export const createComment = joi.object().keys({
    postId: globalFields.id.required(),
    commentId: globalFields.id,
    content: joi.string().min(2).max(50000).trim(),
    file: joi.array().items(globalFields.file).max(2)
}).or('content', 'file')


export const updateComment = joi.object().keys({
    postId: globalFields.id.required(),
    commentId: globalFields.id.required(),
    content: joi.string().min(2).max(50000).trim(),
    file: joi.array().items(globalFields.file).max(2)
}).or('content', 'file')

export const freezeComment = joi.object().keys({
    postId: globalFields.id.required(),
    commentId: globalFields.id.required(),
}).required()

export const likeComment = joi.object().keys({
    postId: globalFields.id.required(),
    commentId: globalFields.id.required(),
    action: joi.string().valid('like', 'unlike').required()
}).required()