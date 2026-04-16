import mongoose from "mongoose";

const DBConnection=()=>{
    mongoose.connect(process.env.DB_URI).then(res=>{
        console.log(`DB Connected`);
    }).catch(err=>{
        console.error(`Fail To Connection ,,,,${err}`);
    })
}
export default DBConnection;