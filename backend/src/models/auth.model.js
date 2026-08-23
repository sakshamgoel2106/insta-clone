import mongoose from "mongoose";

const userschema = new mongoose.Schema({
    username: {
        type: String,
        unique:[true,"username is taken already"],
        required:[true,"username is required"]
    },
    email: {
        type: String,
        unique: [true, "Email already exists"],
        required:[true,"Email is required"]
    },
    password: {
        type: String,
        required:[true,"Password is required"]
    },
    bio: {
        type: String,
    },
    profileImage: {
        type: String,
        default:"https://ik.imagekit.io/rufox9dki/avatar-default-user-profile-icon-simple-flat-grey-vector-57234191.webp"
    },

    /**
     * 
     */
    following : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }],
    followers : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }]
})

const usermodel  = mongoose.model("users",userschema);

export default usermodel