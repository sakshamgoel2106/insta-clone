import mongoose from "mongoose";

const reelschema = new mongoose.Schema({
    caption: {
        type: String,
        default: "",
    },
    video_url: {
        type: String,
        required: [true, "video is required for creating a reel"],
    },
    thumbnail_url: {
        type: String,
        default: "",
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: [true, "user is required to create a reel"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const ReelModel = mongoose.model("reels", reelschema);
export default ReelModel;
