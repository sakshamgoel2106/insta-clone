import saveModel from "../models/save.model.js";
import Postmodel from "../models/post.model.js";

async function toggleSave(req, res) {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Postmodel.findById(postId);
    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    const existing = await saveModel.findOne({ user: userId, post: postId });

    if (existing) {
        await saveModel.findByIdAndDelete(existing._id);
        return res.status(200).json({ message: "Post unsaved", saved: false });
    }

    await saveModel.create({ user: userId, post: postId });
    return res.status(201).json({ message: "Post saved", saved: true });
}

async function getSavedPosts(req, res) {
    const userId = req.user.id;

    const saves = await saveModel
        .find({ user: userId })
        .populate({
            path: "post",
            populate: { path: "user", select: "username profileImage" },
        })
        .sort({ createdAt: -1 });

    const posts = saves.map((s) => s.post).filter(Boolean);

    return res.status(200).json({
        message: "Saved posts fetched",
        posts,
    });
}

async function getSavedPostIds(req, res) {
    const userId = req.user.id;
    const saves = await saveModel.find({ user: userId }).select("post");
    const postIds = saves.map((s) => s.post.toString());
    return res.status(200).json({ postIds });
}

export { toggleSave, getSavedPosts, getSavedPostIds };
