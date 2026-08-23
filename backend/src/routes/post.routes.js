import express from "express";
const Postrouter = express.Router();
import multer from "multer";
import {createPost,GetPost , GetDetails , likePost, GetAllPosts, getPostById} from "../controllers/post.controller.js";
import { identifyuser } from "../middlewares/auth.middleware.js";

const upload = multer({storage : multer.memoryStorage()})

Postrouter.post("/",upload.single("file"),identifyuser,createPost)

Postrouter.get("/",identifyuser,GetPost)

Postrouter.get("/details/:postId",identifyuser,GetDetails)

Postrouter.post("/like/:postId",identifyuser,likePost)

Postrouter.get("/feed",identifyuser,GetAllPosts)

Postrouter.get("/:postId", identifyuser, getPostById)

export default Postrouter