
export const asyncHandler=(fun)=>{
    return (req,res,next)=>{
        fun(req,res,next).catch(error=>{
            error.status=500;
            return next(error)
        })
    }
}

export const globalErrorHandleing=(error ,req,res,next)=>{
    if (process.env.mode=='dev') {
        return res.status(error.cause || 500).json({message:error.message,error,stack:error.stack})
    }
    return res.status(error.cause || 500).json({message:error.message})
}