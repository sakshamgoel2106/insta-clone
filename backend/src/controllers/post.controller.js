import Postmodel from "../models/post.model.js";
import ImageKit, { toFile } from "@imagekit/nodejs";
import likeModel from "../models/like.model.js";
import jwt from "jsonwebtoken";
import { identifyuser } from "../middlewares/auth.middleware.js";

async function createPost(req, res) {

        const imagekit = new ImageKit({
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
        });

        

        const file = await imagekit.files.upload({
            file: await toFile(Buffer.from(req.file.buffer), req.file.originalname),
            fileName: req.file.originalname,
            folder: "insta-clone",
        });

        const post  = await Postmodel.create({
            caption: req.body.caption,
            Image_url: file.url,
            user: req.user.id,
            aspectRatio: req.body.aspectRatio || "1:1",
        })

        res.status(201).json({
            message:"post created successfully",
            post
        })

        
}

async function GetPost(req,res){

    const userId = req.user.id

    const posts = await Postmodel.find({user:userId})

    res.status(200).json({
        message: "post fetched successfully",
        posts
    })
    
}

async function GetDetails(req,res){
    
    const userId = req.user.id 
    const postId = req.params.postId

    const post = await Postmodel.findById(postId)

    if(!post){
        return res.status(404).json({
            message:"post not found"
        })
    }

    const isvaliduser = post.user.toString() === userId

    if(!isvaliduser){
        return res.status(403).json({
            message:"forbidden content access"
        })
    }

    res.status(200).json({
        message:"post details fetched successfully",
        post,
        isvaliduser
    })



}

async function likePost(req,res){
    const userId = req.user.id
    const postId = req.params.postId

    const post = await Postmodel.findById(postId)

    if(!post){
        return res.status(404).json({
            message:"post not found"
        })
    }

    const like = await likeModel.findOne({
        post:postId,
        user:userId
    })

    if(like){
        return res.status(400).json({
            message:"post already liked"
        })
    }

}

async function GetAllPosts(req, res) {
    const posts = await Postmodel.find({}).populate("user", "username profileImage").sort({ createdAt: -1 });
    res.status(200).json({
        message: "all posts fetched successfully",
        posts
    });
}

async function getPostById(req, res) {
    const { postId } = req.params;

    const post = await Postmodel.findById(postId).populate("user", "username profileImage");
    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({
        message: "Post fetched successfully",
        post
    });
}

export { createPost , GetPost , GetDetails , likePost, GetAllPosts, getPostById } ;
