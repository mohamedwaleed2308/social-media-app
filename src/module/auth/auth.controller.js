import { Router } from "express";
import * as registrationService from './services/registration.service.js'
import * as loginService from './services/login.service.js'
import { validation } from "../../middleWare/validation.middleWare.js";
import * as validators from './auth.validation.js'
const router = Router();

router.post('/signup', validation(validators.signup), registrationService.signup)
router.patch('/confirm-email', validation(validators.confirmEmail), registrationService.confirmEmail)
router.post('/login/loginVerification', validation(validators.verify2StepVerification), loginService.twoStepVerification)
// router.post('/login-phone',validation(validators.loginPhone),loginService.loginPhone)
router.post('/loginWithGmail', loginService.loginWithGmail)
router.get('/refresh-token', loginService.refreshToken)
router.post('/forget-password', validation(validators.forgetPassword), loginService.forgetPassword)
router.post('/reset-password', validation(validators.resetPassword), loginService.resetPassword)

router.post('/login', loginService.login)
// router.post('/login', validation(validators.login), loginService.login)


export default router;