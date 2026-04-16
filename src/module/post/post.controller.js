import { Router } from "express";
import { authentication, authorization } from "../../middleWare/auth.middleware.js";
import { validation } from "../../middleWare/validation.middleWare.js";
import { uploadCloudFile } from "../../utils/multer/cloud.multer.js";
import * as postService from "./services/post.service.js"
import * as validators from "./post.validation.js"
import commentController from "../comment/comment.controller.js"
import { endPoint } from "./post.autherization.js";
import { fileValidationTypes } from "../../utils/multer/local.multer.js";
const router = Router();

// sub-routing
router.use('/:postId/comment', commentController)


router.get('/get-posts',
    authentication(),
    postService.getPosts)

// validation(validators.createPost),
router.post('/create-post', authentication(), authorization(endPoint.createPost)
    , uploadCloudFile(fileValidationTypes.image).array('attachement', 2), postService.createPost)

router.patch('/update-post/:postId', validation(validators.updatePost), authentication(), authorization(endPoint.createPost)
    , uploadCloudFile(fileValidationTypes.image).array('attachement', 2), postService.updatePost)

router.delete('/freeze-post/:postId', authentication(),
    authorization(endPoint.freezePost),
    validation(validators.freezePost)
    , postService.freezePost)

router.patch('/unfreeze-post/:postId', authentication(),
    authorization(endPoint.freezePost),
    validation(validators.freezePost)
    , postService.unfreezePost)

router.patch('/like-post/:postId', authentication(),
    authorization(endPoint.likePost),
    validation(validators.likePost)
    , postService.likePost)

router.delete('/undo-post', authentication(), postService.undoPost)
router.patch('/archive-post/:postId', validation(validators.archivePost), authentication(), postService.archivePost)
// router.patch('/unlike-post/:postId',authentication(),
// authorization(endPoint.likePost),
// validation(validators.likePost)
// ,postService.unlikePost)

// get public post 
router.get('/get-public-posts', authentication(), authorization(endPoint.getPublicPosts), postService.publicPosts)
// get friends post
router.get('/get-friends-posts', authentication(), authorization(endPoint.getPublicPosts), postService.friendsPosts)
// get posts for spcific user
router.get('/get-post-specificUser/:userId', authentication(), authorization(endPoint.getPublicPosts), postService.specificPost)

// soft delete for post and comments
export default router; 