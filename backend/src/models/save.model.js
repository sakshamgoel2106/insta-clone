import mongoose from "mongoose";

const saveschema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "posts",
            required: true,
        },
    },
    { timestamps: true }
);

saveschema.index({ user: 1, post: 1 }, { unique: true });

const saveModel = mongoose.model("saves", saveschema);
export default saveModel;
