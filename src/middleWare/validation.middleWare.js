
export const validation = (schema) => {
    return (req, res, next) => {
        const inputData = { ...req.body, ...req.params, ...req.query }
        if (req.headers['accept-language']) {
            inputData['accept-language'] = req.headers['accept-language']
        }
        const validationResult = schema.validate(inputData, { abortEarly: false })
        if (validationResult.error) {
            return res.status(400).json({ message: 'Validation Error', details: validationResult.error.details })
        }
        return next();
    }
}


export const validationGraphQl =async ({schema,args}) => {
        
        const validationResult = schema.validate(args, { abortEarly: false })
        if (validationResult.error) {
            throw new Error(JSON.stringify({
                message:'Validation Error',
                details: validationResult.error.details
            }))
        }
        return true;
}