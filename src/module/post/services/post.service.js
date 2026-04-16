import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../DB/db.service.js"
import { cloud } from "../../../utils/multer/cloudinary.multer.js";
import { postModel } from "../../../DB/model/Post.model.js";
import { roleTypes } from "../../../DB/model/User.model.js";
import { pagination } from "../../../utils/pagination/pagination.js";

export const getPosts = asyncHandler(async (req, res, next) => {

    let { page, size } = req.query;
    const data = await pagination({
        page, size, model: postModel,
        filter: { isDeleted: { $exists: false } },
        populate: [
            {
                path: 'comment',
                match: {
                    isDeleted: { $exists: false },
                    match: { commentId: { $exists: false } } // because not repeat the comment 
                },
                populate: [
                    {
                        path: 'reply',
                        match: { isDeleted: { $exists: false } }
                    }
                ]
            }
        ],
    })

    // const result=[];
    // const cursor = postModel.find({}).cursor();

    // for (let post = await cursor.next(); post != null; post = await cursor.next()) {
    //     const comment=await dbService.find({
    //         model:commentModel,
    //         filter:{
    //             postId:post._id,
    //             isDeleted:{$exists:false}
    //         }
    //     })
    //     result.push({post,comment})
    // }
    successResponse({ res, message: 'Done', status: 201, data })
})


export const createPost = asyncHandler(async (req, res, next) => {
    const { content } = req.body;

    let attachements = []
    for (const file of req.files) {
        const { secure_url, public_id } = await cloud.uploader.upload(file.path, { folder: `${process.env.appName}/post` })
        attachements.push({ secure_url, public_id })
    }
    const post = await dbService.create({
        model: postModel,
        data: {
            content,
            attachements,
            createdBy: req.user._id,
            time: Date.now()
        }
    })
    successResponse({ res, message: 'Done', status: 201, data: { post } })
})

export const updatePost = asyncHandler(async (req, res, next) => {

    let attachements = []
    if (!req.files.length) {
        return next(new Error('in-valid Data', { cause: 400 }))
    }

    for (const file of req.files) {
        const { secure_url, public_id } = await cloud.uploader.upload(file.path, { folder: `${process.env.appName}/post` })
        attachements.push({ secure_url, public_id })
    }
    req.body.attachements = attachements
    const post = await dbService.findOneAndUpdate({
        model: postModel,
        filter: { _id: req.params.postId, isDeleted: { $exists: false }, createdBy: req.user._id },
        data: {
            // req.body.content,
            // attachements is array but we replace this two lines to spread obj ...req.body
            ...req.body,
            updatedBy: req.user._id,
        },
        options: { new: true }
    })
    successResponse({ res, message: 'Done', status: 200, data: { post } })
})

export const freezePost = asyncHandler(async (req, res, next) => {

    const owner = req.user.role === roleTypes.admin ? {} : { createdBy: req.user._id }
    const post = await postModel.findOneAndUpdate({ _id: req.params.postId, isDeleted: { $exists: false }, ...owner },
        {
            isDeleted: Date.now(),
            deletedBy: req.user._id,
            updatedBy: req.user._id
        }, { new: true }
    )
    return successResponse({ res, message: 'Done', status: 200, data: { post } })
})

export const unfreezePost = asyncHandler(async (req, res, next) => {
    const post = await dbService.findOneAndUpdate({
        model: postModel,
        filter: {
            _id: req.params.postId,
            isDeleted: { $exists: true },
            deletedBy: req.user._id
        },
        data: {
            $unset: {
                deletedBy: 0,
                isDeleted: 0
            },
            updatedBy: req.user._id,
        },
        options: { new: true }
    })
    successResponse({ res, message: 'Done', status: 200, data: { post } })
})

export const likePost = asyncHandler(async (req, res, next) => {
    const data = req.query.action === 'unlike' ? { $pull: { likes: req.user._id } } : { $addToSet: { likes: req.user._id } }
    const post = await dbService.findOneAndUpdate({
        model: postModel,
        filter: {
            _id: req.params.postId,
            isDeleted: { $exists: false },
        },
        data,
        options: { new: true }
    })
    successResponse({ res, message: 'Done', status: 200, data: { post } })
})


export const undoPost = asyncHandler(async (req, res, next) => {
    const posts = await dbService.find({
        model: postModel,
        filter: { createdBy: req.user._id, isDeleted: { $exists: false } }
    })
    posts.filter(async (post) => {
        if ((Date.now() - post.time) / 1000 <= 120) {
            await dbService.deleteMany({
                model: postModel,
                filter: { _id: post._id }
            })

        }
    })

    return successResponse({ res, message: 'posts is deleted', status: 200, data: {} })
})
export const archivePost = asyncHandler(async (req, res, next) => {
    const { postId } = req.params
    const post = await dbService.findOne({
        model: postModel,
        filter: { _id: postId, createdBy: req.user._id, isDeleted: { $exists: false } }
    })

    if (!post) {
        return next(new Error('in-valid postId'))
    }
    let archive = undefined
    if (((Date.now() - post.createdAt) / 1000) / 60 / 60 >= 24) {
        archive = await dbService.findOneAndUpdate({
            model: postModel,
            filter: { _id: post._id, isArchive: { $exists: false } },
            data: { isArchive: true },
            options: {
                new: true
            }
        })
    } else {
        return next(new Error('this step is so early'))
    }

    return successResponse({ res, message: 'post is archived', status: 200, data: { archive } })
})

// get public posts
export const publicPosts = asyncHandler(async (req, res, next) => {
    const posts = await dbService.find({
        model: postModel, filter: { createdBy: req.user._id, isDeleted: { $exists: false } }
    })
    if (!posts) {
        return next(new Error('posts not found', { cause: 404 }))
    }
    return successResponse({ res, message: 'Done', status: 200, data: { posts } })
})


export const friendsPosts = asyncHandler(async (req, res, next) => {
    const usersId = []
    req.user.friends.filter(friend => {
        usersId.push(friend.userId.toString())
    })
    let results = []
    for (const userId of usersId) {
        const posts = await dbService.find({
            model: postModel, filter: { createdBy: userId, isDeleted: { $exists: false } }
        })
        results.push(posts)
    }

    if (!results.length) {
        return next(new Error('posts not found', { cause: 404 }))
    }
    return successResponse({ res, message: 'Done', status: 200, data: { results } })
})

export const specificPost = asyncHandler(async (req, res, next) => {
    const { userId } = req.params
    const posts = await dbService.find({
        model: postModel, filter: { createdBy: userId, isDeleted: { $exists: false } }
    })
    if (!posts) {
        return next(new Error('posts not found', { cause: 404 }))
    }
    return successResponse({ res, message: 'Done', status: 200, data: { posts } })
})