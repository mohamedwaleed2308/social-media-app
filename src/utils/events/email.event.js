import {EventEmitter}from 'node:events'
import { nanoid,customAlphabet } from 'nanoid';
import { verificationEmailTemplate } from '../email/template/email.template.js';
import { userModel } from '../../DB/model/User.model.js';
import { generateHash } from '../security/hash.js';
import { sendEmail } from '../email/send.email.js';
import * as dbService from '../../DB/db.service.js'
export const emailEvent=new EventEmitter()

const sendCode=async({data,subject="confirm-Email"}={})=>{
    const {email,id}=data;
    const otp= customAlphabet('123456789',4)();
    const html=verificationEmailTemplate({code:otp})
    const otpHash= generateHash({plainText:otp})
    let subjectOtp={}
    switch (subject) {
        case 'confirm-Email':
            subjectOtp={emailOtp:otpHash,otpTime:Date.now()}
            break;
        case 'update-Email':
            subjectOtp={updateEmailOtp:otpHash,newEmailOtpTime:Date.now()}
            break;
        case 'forget-Password':
            subjectOtp={forgetPasswordOtp:otpHash,otpTime:Date.now()}
            break;
    
        default:
            break;
    }
    await dbService.findOneAndUpdate({model:userModel,filter:{_id:id},data:subjectOtp,options:{new:true}})
    await sendEmail({to:email,html,subject:'confirm-Email'})
}



emailEvent.on('confirmEmail',async(data)=>{
    await sendCode({data,subject:'confirm-Email'})
})
emailEvent.on('updateEmail',async(data)=>{
    await sendCode({data,subject:'update-Email'})
})
emailEvent.on('forgetPassword',async(data)=>{
    await sendCode({data,subject:'forget-Password'})
})

// const {email}=data;
    // const otp= customAlphabet('123456789',4)();
    // const html=verificationEmailTemplate({code:otp})
    // const forgetPasswordOtp= generateHash({plainText:otp})
    // await userModel.updateOne({email},{forgetPasswordOtp})
    // await sendEmail({to:email,html,subject:'forget-password'})