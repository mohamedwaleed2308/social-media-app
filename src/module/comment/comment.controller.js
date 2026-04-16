import { Router } from 'express'
import * as validators from "./comment.validation.js"
import * as commentService from './services/comment.service.js'
import { authentication, authorization } from '../../middleWare/auth.middleware.js';
import { commentEndPoint } from './comment.authorization.js';
import { uploadCloudFile } from '../../utils/multer/cloud.multer.js';
import { fileValidationTypes } from '../../utils/multer/local.multer.js';
import { validation } from '../../middleWare/validation.middleWare.js';
const router = Router({
    mergeParams: true,
    strict: true,
    caseSensitive: true
})

router.post('/', authentication(), authorization(commentEndPoint.createPost),
    uploadCloudFile(fileValidationTypes.image).array('attachement', 2),
    validation(validators.createComment)
    , commentService.createComment)

router.patch('/:commentId', authentication(), authorization(commentEndPoint.updatePost),
    uploadCloudFile(fileValidationTypes.image).array('attachement', 2),
    validation(validators.updateComment)
    , commentService.updateComment)

router.delete('/:commentId/freeze', authentication(), authorization(commentEndPoint.freezeComent),
    uploadCloudFile(fileValidationTypes.image).array('attachement', 2),
    validation(validators.freezeComment)
    , commentService.freezeComment)

router.delete('/:commentId/unFreeze', authentication(), authorization(commentEndPoint.freezeComent),
    uploadCloudFile(fileValidationTypes.image).array('attachement', 2),
    validation(validators.freezeComment)
    , commentService.unFreezeComment)

router.patch('/:commentId/:action', authentication(),
    authorization(commentEndPoint.likeComment),
    validation(validators.likeComment)
    , commentService.likeComment)

export default router;