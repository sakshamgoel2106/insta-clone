import mongoose from "mongoose";

const followschema = new mongoose.Schema({
    //edge collection 
    follower : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "users",
        required : [true,"follower is required"]
    },
    followername : String,
    followee : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "users",
        required : [true,"followee is required"]
    },
    followeename : String,
    status :{
        type : String,
        default : "pending",
        enum:{
            values : ["accepted","pending","rejected"],
            message : "status can be accepted , pending or rejected"
        }
    }
},{
    timestamps : true
})

followschema.index({follower:1,followee:1},{unique:true}) //iska mtlb hai ki jo user follow kr rha hai wo followee ke liye unique hoga

const followModel = mongoose.model("follows",followschema)

export default followModel