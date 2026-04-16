
// create
export const create=async({model,data={}}={})=>{
    const document=model.create(data);
    return document;
}

// finders
export const find=async({model,filter={},select='',populate=[],skip=0,limit=100}={})=>{
    const documents=model.find(filter).select(select).populate(populate).skip(skip).limit(limit);
    return documents;
}
export const findOne=async({model,filter={},select='',populate=[]}={})=>{
    const document=model.findOne(filter).select(select).populate(populate);
    return document;
}
export const findById=async({model,id='',select='',populate=[]}={})=>{
    const document=model.findById(id).select(select).populate(populate);
    return document;
}

// update
export const updateOne=async({model,filter={},data={},options={}}={})=>{
    const document=model.updateOne(filter,data,options);
    return document;
}
export const updateMany=async({model,filter={},data={},options={}}={})=>{
    const documents=model.updateMany(filter,data,options);
    return documents;
}
export const findOneAndUpdate=async({model,filter={},data={},options={},select='',populate=[]}={})=>{
    const document=model.findOneAndUpdate(filter,data,options).select(select).populate(populate);
    return document;
}
export const findByIdAndUpdate=async({model,id='',data={},options={},select='',populate=[]}={})=>{
    const document=model.findByIdAndUpdate(id,data,options).select(select).populate(populate);
    return document;
}


// delete
export const deleteOne=async({model,filter={}}={})=>{
    const document=model.deleteOne(filter);
    return document;
}
export const deleteMany=async({model,filter={}}={})=>{
    const documents=model.deleteMany(filter);
    return documents;
}
export const findOneAndDelete=async({model,filter={},select='',populate=[]}={})=>{
    const document=model.findOneAndDelete(filter).select(select).populate(populate);
    return document;
}
export const findByIdAndDelete=async({model,id='',select='',populate=[]}={})=>{
    const document=model.findByIdAndDelete(id).select(select).populate(populate);
    return document;
}
