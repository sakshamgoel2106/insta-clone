import crypto from "crypto"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import usermodel from "../models/auth.model.js"
import Postmodel from "../models/post.model.js"
import ReelModel from "../models/reel.model.js"

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000
};

async function register(req,res){
    try {
        const {username,email,password,bio,profileImage} = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Username, email, and password are required" });
        }

        const isuseralreadyexists = await usermodel.findOne({
            $or:[{email},{username}]
        });
        if(isuseralreadyexists){
            return res.status(400).json({message:"user already exists" + (isuseralreadyexists.email === email ? "email already exists" : "username already exists")});
        }
        const hash = await bcrypt.hash(password,10);

        const user = await usermodel.create({username,email,password:hash,bio,profileImage});

        const token = jwt.sign({id:user._id,email:user.email,username:user.username},process.env.JWT_SECRET,{expiresIn : "1d"});

        res.cookie("jwt_token", token, cookieOptions);

        return res.status(201).json({
            message:"User created successfully",
            user:{
                username:user.username,
                email:user.email,
                bio:user.bio,
                profileImage:user.profileImage,
                followers: user.followers || [],
                following: user.following || []
            }});
        } catch (error) {
            console.error("Registration failed:", error);
            return res.status(500).json({ message: "Registration failed", error: error.message });
    }
    }



async function login(req,res) {
    const {username,email,password} = req.body

        const user = await usermodel.findOne({
            $or:[{email:email},{username:username}] 
        })

        if(!user){
            return res.status(404).json({message:"User not found"})
        }

        // Use bcrypt.compare to check password
        const ispasswordvalid = await bcrypt.compare(password, user.password);

        if(!ispasswordvalid){
            return res.status(401).json({message:"Invalid credentials"})
        }

        const token = jwt.sign({id:user._id,email:user.email,username:user.username},process.env.JWT_SECRET,{expiresIn : "1d"})

        res.cookie("jwt_token", token, cookieOptions)

        return res.status(200).json({
            message:"User logged in successfully",
            user:{
                username:user.username,
                email:user.email,
                bio:user.bio,
                profileImage:user.profileImage,
                followers: user.followers || [],
                following: user.following || []
            }
        })
    }

async function getme(req,res){
    const userid = req.user.id

    const user = await usermodel.findById(userid)

    res.status(200).json({
        message:"User fetched successfully",
        user:{
            username:user.username,
            email:user.email,
            bio:user.bio,
            profileImage:user.profileImage,
            followers: user.followers || [],
            following: user.following || []
        }
    }
    )
}

import ImageKit, { toFile } from "@imagekit/nodejs";

async function updateProfile(req, res) {
    try {
        const userId = req.user.id;
        const { bio, username } = req.body;
        const updates = {};

        if (bio !== undefined) {
            updates.bio = bio;
        }
        
        if (username) {
            const trimmedUsername = username.trim();
            if (trimmedUsername !== req.user.username) {
                // Check if username is already taken by someone else
                const existing = await usermodel.findOne({ username: trimmedUsername });
                if (existing) {
                    return res.status(400).json({ message: "Username is already taken" });
                }
                updates.username = trimmedUsername;
            }
        }

        if (req.file) {
            const imagekit = new ImageKit({
                privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
                publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
                urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
            });

            const file = await imagekit.files.upload({
                file: await toFile(Buffer.from(req.file.buffer), req.file.originalname),
                fileName: req.file.originalname,
                folder: "insta-clone/profiles",
            });
            updates.profileImage = file.url;
        }

        const user = await usermodel.findByIdAndUpdate(userId, updates, { new: true });

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                username: user.username,
                email: user.email,
                bio: user.bio,
                profileImage: user.profileImage,
                followers: user.followers || [],
                following: user.following || []
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to update profile", error: error.message });
    }
}

async function logout(req, res) {
    res.clearCookie("jwt_token", cookieOptions);
    return res.status(200).json({ message: "Logged out successfully" });
}

async function searchUsers(req, res) {
    const { q } = req.query;
    if (!q) return res.status(200).json({ users: [] });

    const users = await usermodel.find({
        username: { $regex: q, $options: "i" }
    }).select("username profileImage bio").limit(10);

    return res.status(200).json({ users });
}

async function getUserProfile(req, res) {
    const { username } = req.params;

    const user = await usermodel.findOne({ username }).select("-password");
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const posts = await Postmodel.find({ user: user._id }).sort({ createdAt: -1 });
    const reels = await ReelModel.find({ user: user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
        user,
        posts,
        reels
    });
}

async function toggleFollow(req, res) {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
        return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const targetUser = await usermodel.findById(userId);
    const currentUser = await usermodel.findById(currentUserId);

    if (!targetUser || !currentUser) {
        return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = currentUser.following.includes(userId);

    if (isFollowing) {
        // Unfollow
        currentUser.following.pull(userId);
        targetUser.followers.pull(currentUserId);
    } else {
        // Follow
        currentUser.following.push(userId);
        targetUser.followers.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    return res.status(200).json({
        message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
        following: currentUser.following
    });
}

export {register,login,getme,logout,updateProfile,searchUsers,getUserProfile,toggleFollow}