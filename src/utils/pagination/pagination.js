import * as dbService from '../../DB/db.service.js'
import { userModel } from '../../DB/model/User.model.js';

export const pagination = async ({ page = 1, size = 4, model, filter = {}, populate = [], select = '' } = {}) => {
    page = parseInt(page < 1 ? process.env.page : page)
    size = parseInt(size < 1 ? process.env.size : size)
    const skip = (page - 1) * size;
    const count = await model.find(filter).countDocuments()
    const data = await dbService.find({
        model: model,
        filter,
        populate,
        select,
        skip,
        limit: size
    })
    return {data,page,size,count}
}