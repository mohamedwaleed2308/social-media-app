import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../DB/db.service.js"
import { postModel } from "../../../DB/model/Post.model.js";
import { commentModel } from "../../../DB/model/Comment.model.js";
import { cloud } from "../../../utils/multer/cloudinary.multer.js";
import { roleTypes } from "../../../DB/model/User.model.js";

export const createComment = asyncHandler(async (req, res, next) => {
    const { postId, commentId } = req.params;
    if (commentId && ! await dbService.findOne({
        model: commentModel,
        filter: { _id: commentId, postId, isDeleted: { $exists: false } }
    })) {
        return next(new Error('in-valid parent comment', { cause: 404 }))
    }
    const post = await dbService.findOne({
        model: postModel,
        filter: { _id: postId }
    })
    if (!post) {
        return next(new Error('in-valid post id', { cause: 404 }))
    }
    if (!req.files?.length) {
        return next(new Error('attachement is required', { cause: 400 }))
    }
    const attachements = []
    for (const file of req.files) {
        const { secure_url, public_id } = await cloud.uploader.upload(file.path,
            { folder: `${process.env.appName}/user/${post.createdBy}/post/${postId}/comment` })
        attachements.push({ secure_url, public_id })
    }
    req.body.attachements = attachements
    const comment = await dbService.create({
        model: commentModel,
        data: {
            ...req.body,
            commentId,
            postId,
            createdBy: req.user._id
        }
    })
    return successResponse({ res, status: 201, message: 'comment added', data: { comment } })
})

export const updateComment = asyncHandler(async (req, res, next) => {
    const { postId, commentId } = req.params;
    const comment = await dbService.findOne({
        model: commentModel,
        filter: { _id: commentId, isDeleted: { $exists: false }, postId, createdBy: req.user._id },
        populate: [
            {
                path: "postId"
            }
        ]
    })
    if (!comment || comment.postId.isDeleted) {
        return next(new Error('in-valid comment id', { cause: 404 }))
    }
    if (req.files?.length) {
        const attachements = []
        for (const file of req.files) {
            const { secure_url, public_id } = await cloud.uploader.upload(file.path,
                { folder: `${process.env.appName}/user/${comment.postId.createdBy}/post/${postId}/comment` })
            attachements.push({ secure_url, public_id })
        }
        req.body.attachements = attachements

    }

    const newComment = await dbService.findOneAndUpdate({
        model: commentModel,
        filter: { _id: commentId, createdBy: req.user._id, isDeleted: { $exists: false } },
        data: {
            ...req.body,
        },
        options: {
            new: true
        }
    })
    return successResponse({ res, status: 201, message: 'comment added', data: { newComment } })
})

export const freezeComment = asyncHandler(async (req, res, next) => {
    const { postId, commentId } = req.params;
    const comment = await dbService.findOne({
        model: commentModel,
        filter: { _id: commentId, isDeleted: { $exists: false }, postId, createdBy: req.user._id },
        populate: [
            {
                path: "postId"
            }
        ]
    })
    if (!comment || (
        comment.createdBy.toString() != req.user._id.toString() &&
        comment.postId.createdBy.toString() != req.user._id.toString() &&
        req.user.role != roleTypes.admin
    )) {
        return next(new Error('in-valid comment id or not authorized user', { cause: 404 }))
    }
    const newComment = await dbService.findOneAndUpdate({
        model: commentModel,
        filter: { _id: commentId, createdBy: req.user._id, isDeleted: { $exists: false } },
        data: {
            isDeleted: Date.now(),
            deletedBy: req.user._id
        },
        options: {
            new: true
        }
    })
    return successResponse({ res, status: 201, message: 'comment is freezed', data: { newComment } })
})

export const unFreezeComment = asyncHandler(async (req, res, next) => {
    const { postId, commentId } = req.params;
    const comment = await dbService.findOne({
        model: commentModel,
        filter: { _id: commentId, isDeleted: { $exists: true }, postId, deletedBy: req.user._id },
    })
    if (!comment) {
        return next(new Error('not freezed account'))
    }
    const unfreezeComment = await dbService.findOneAndUpdate({
        model: commentModel,
        filter: { _id: commentId, createdBy: req.user._id, isDeleted: { $exists: true } },
        data: {
            $unset: {
                isDeleted: 0,
                deletedBy: 0,
            },
            updatedBy: req.user._id
        },
        options: {
            new: true
        }
    })
    return successResponse({ res, status: 201, message: 'comment is freezed', data: { unfreezeComment } })
})

export const likeComment = asyncHandler(async (req, res, next) => {
    const { commentId, postId, action } = req.params;
    const data = action === 'like' ? { $addToSet: { likes: req.user._id } } : { $pull: { likes: req.user._id } }
    const comment = await dbService.findOneAndUpdate({
        model: commentModel,
        filter: {
            _id: commentId,
            postId,
            isDeleted: { $exists: false },
        },
        data,
        options: {
            new: true
        }
    })
    if (!comment) {
        return next(new Error('comment is not found', { cause: 404 }))
    }
    return successResponse({ res, message: 'Done', status: 201, data: { comment } })

})