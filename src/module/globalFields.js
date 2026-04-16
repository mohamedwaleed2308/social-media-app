import joi from "joi";
import { Types } from "mongoose";


export const checkObjectId = (vlaue, helper) => {
    return Types.ObjectId.isValid(vlaue) ? true : helper.message('in-valid ObjectId')
}

const fileObj = {
    fieldname: joi.string().valid('attachement'),
    originalname: joi.string(),
    encoding: joi.string(),
    mimetype: joi.string(),
    finalPath: joi.string(),
    destination: joi.string(),
    filename: joi.string(),
    path: joi.string(),
    size: joi.string(),
}


export const globalFields = {
    userName: joi.string().min(2).max(25).trim(),
    email: joi.string().email({ tlds: { allow: ['com', 'net'] }, minDomainSegments: 2, maxDomainSegments: 3 }),
    password: joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)),
    confirmPassword: joi.string().valid(joi.ref('password')),
    code: joi.string().pattern(new RegExp(/^\d{4}$/)),
    phone: joi.string().pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)),
    gender: joi.string().valid('male', 'female'),
    DOB: joi.date().less('now'),
    id: joi.string().custom(checkObjectId),
    fileObj,
    file: joi.object().keys(fileObj)

}