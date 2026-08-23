import mongoose from "mongoose";

const postschema = new mongoose.Schema({
    caption:{
        type : String,
        default : "",
    },
    Image_url:{
        type : String,
        required : [true,"image is required for creating a post "]
    },
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref : "users",
        required : [true,"user is required to create a post"]
    },
    aspectRatio: {
        type: String,
        enum: ["1:1", "4:5", "16:9"],
        default: "1:1",
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Postmodel = mongoose.model("posts",postschema);

export default Postmodel