import ReelModel from "../models/reel.model.js";
import ImageKit, { toFile } from "@imagekit/nodejs";

async function createReel(req, res) {
    if (!req.file) {
        return res.status(400).json({ message: "Video file is required" });
    }

    const imagekit = new ImageKit({
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });

    const uploaded = await imagekit.files.upload({
        file: await toFile(Buffer.from(req.file.buffer), req.file.originalname),
        fileName: req.file.originalname,
        folder: "insta-clone/reels",
    });

    const reel = await ReelModel.create({
        caption: req.body.caption || "",
        video_url: uploaded.url,
        user: req.user.id,
    });

    const populated = await ReelModel.findById(reel._id).populate(
        "user",
        "username profileImage"
    );

    return res.status(201).json({
        message: "Reel created successfully",
        reel: populated,
    });
}

async function getAllReels(req, res) {
    const reels = await ReelModel.find({})
        .populate("user", "username profileImage")
        .sort({ createdAt: -1 });

    return res.status(200).json({
        message: "Reels fetched successfully",
        reels,
    });
}

export { createReel, getAllReels };
