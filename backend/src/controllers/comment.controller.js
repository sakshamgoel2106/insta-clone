import commentModel from "../models/comment.model.js";

async function addComment(req, res) {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    if (!text || !text.trim()) {
        return res.status(400).json({ message: "Comment text is required" });
    }

    const comment = await commentModel.create({
        text: text.trim(),
        user: userId,
        post: postId,
    });

    const populated = await commentModel
        .findById(comment._id)
        .populate("user", "username profileImage");

    return res.status(201).json({
        message: "Comment added successfully",
        comment: populated,
    });
}

async function getComments(req, res) {
    const { postId } = req.params;

    const comments = await commentModel
        .find({ post: postId })
        .populate("user", "username profileImage")
        .sort({ createdAt: 1 });

    return res.status(200).json({
        message: "Comments fetched successfully",
        comments,
    });
}

async function addReelComment(req, res) {
    const { reelId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    if (!text || !text.trim()) {
        return res.status(400).json({ message: "Comment text is required" });
    }

    const comment = await commentModel.create({
        text: text.trim(),
        user: userId,
        reel: reelId,
    });

    const populated = await commentModel
        .findById(comment._id)
        .populate("user", "username profileImage");

    return res.status(201).json({
        message: "Comment added successfully",
        comment: populated,
    });
}

async function getReelComments(req, res) {
    const { reelId } = req.params;

    const comments = await commentModel
        .find({ reel: reelId })
        .populate("user", "username profileImage")
        .sort({ createdAt: 1 });

    return res.status(200).json({
        message: "Comments fetched successfully",
        comments,
    });
}

export { addComment, getComments, addReelComment, getReelComments };
