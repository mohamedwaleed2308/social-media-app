import multer from "multer";
import path from "node:path";
import fs from "node:fs";

export const fileValidationTypes={
    image:['image/jpg','image/png','image/jpeg','image/gif'],
    document:['application/json','application/pdf','plain/txt'],
    video:['video/mp4'], 
}

export const uploadDiskFile=(customPath='general',fileValidation=[])=>{

    const basePath=`uploads/${customPath}`
    const fullPath=`./src/${basePath}`
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath,{recursive:true})
    } 
    
    const storage=multer.diskStorage({
        destination:(req , file , cb)=>{
            cb(null,path.resolve(fullPath))
        },
        filename:(req, file,cb)=>{
            const uniqueSuffix=Date.now()+'-'+Math.round(Math.random()*1E9)
            file.finalPath= basePath + '/'+uniqueSuffix+"_"+file.originalname
            cb(null,uniqueSuffix+"_"+file.originalname)
        }
    })
    const fileFilter=(req,file,cb)=>{
        if (fileValidation.includes(file.mimetype)) {
            cb(null,true)
        }else{
            cb("In-valid file format",false)
        }
    }
    return multer({dest:'defaultUpload',fileFilter,storage})
}