import joi from "joi";
import { globalFields } from "../globalFields.js";

export const signup = joi.object().keys({
    userName: globalFields.userName.required(),
    email: globalFields.email.required(),
    password: globalFields.password.required(),
    confirmPassword: globalFields.confirmPassword.required(),
    phone: globalFields.phone.required()
}).required()


export const confirmEmail = joi.object().keys({
    email: globalFields.email.required(),
    code: globalFields.code.required()
}).required()


export const login = joi.object().keys({
    email: globalFields.email.required(),
    password: globalFields.password.required()
}).required()

export const verify2StepVerification = joi.object().keys({
    email: globalFields.email.required(),
    code: globalFields.code.required()
}).required()

export const loginPhone = joi.object().keys({
    phone: globalFields.phone.required(),
    password: globalFields.password.required()
}).required()

export const forgetPassword = joi.object().keys({
    email: globalFields.email.required(),
}).required()

export const resetPassword = joi.object().keys({
    email: globalFields.email.required(),
    code: globalFields.code.required(),
    password: globalFields.password.required(),
    confirmPassword: globalFields.confirmPassword.required()
}).required()
