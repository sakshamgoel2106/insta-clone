import mongoose from "mongoose";

const commentschema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: [true, "Comment text is required"],
            trim: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "posts",
            required: false, // Optional because it could belong to a reel
        },
        reel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "reels",
            required: false, // Optional because it could belong to a post
        },
    },
    { timestamps: true }
);

const commentModel = mongoose.model("comments", commentschema);
export default commentModel;
