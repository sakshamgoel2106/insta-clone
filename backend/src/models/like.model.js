import mongoose from "mongoose";

const likeschema = new mongoose.Schema({
    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"posts",
        required:[true,"post is required"]
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:[true,"user is required"]
    }
},{
    timestamps:true
})

likeschema.index({post:1,user:1},{unique:true})

const likeModel = mongoose.model("likes",likeschema)

export default likeModel