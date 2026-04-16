import { Router } from "express";
import * as userService from "./services/user.service.js"
import { authentication, authorization } from "../../middleWare/auth.middleware.js";
import { validation } from "../../middleWare/validation.middleWare.js";
import * as validators from "./user.validation.js"
import { fileValidationTypes, uploadDiskFile } from "../../utils/multer/local.multer.js";
import { uploadCloudFile } from "../../utils/multer/cloud.multer.js";
import { endPoint } from "./user.auhorization.js";
const router = Router();

router.get('/profile', authentication(), authorization(endPoint.accessRoles), userService.profile)
router.get('/profile/dashboard', authentication(), authorization(endPoint.accessRoles), userService.dashboard)
router.patch('/profile/:userId/changeRoles', validation(validators.changeRoles), authentication(),
    authorization(endPoint.changeRoles),
    userService.changeRoles)
router.get('/profile/:profileId', validation(validators.shareProfile), authentication(), userService.shareProfile)
router.post('/profile/block-user/:profileId/:status', validation(validators.blockUser), authentication(), userService.blockUser)
router.patch('/profile', validation(validators.updateProfile), authentication(), userService.updateProfile)
router.patch('/profile/password', validation(validators.updatePassword), authentication(), userService.updatePassword)
// to update email you to endPoint 
// 1- to send two verification code to old Email and new Email
router.patch('/profile/email', validation(validators.updateEmail), authentication(), userService.updateEmail)
// 2- to change email and unset any field about update process like(tempEmail,emailOtp=oldEmailCode,updateEmailOtp=code)
router.patch('/profile/replace-email', validation(validators.replaceEmail), authentication(), userService.replaceEmail)

// upload image 
router.patch('/profile/upload-image', authentication(),
    uploadCloudFile(fileValidationTypes.image).single('attachement'),
    userService.uploadImage)


// upload array of images(coverImages)
router.patch('/profile/cover-images', authentication(),
    uploadCloudFile(fileValidationTypes.image).array('attachement', 5),
    userService.coverImages)

// upload mix image with pdf
router.patch('/profile/identity', authentication(),
    uploadDiskFile('user/profile/identity', [...fileValidationTypes.image, fileValidationTypes.document[1]]).fields([
        { name: 'image', maxCount: 1 },
        { name: 'file', maxCount: 1 }
    ]),
    userService.identity)

// add friends
router.post('/add-friend/:friendId', validation(validators.addFriend),
    authentication(),
    authorization(endPoint.addFriend),
    userService.addFriendRequest)

router.patch('/accept-friend/:friendRequestId/:status', validation(validators.acceptFriend),
    authentication(),
    authorization(endPoint.addFriend),
    userService.acceptFriend)



export default router;