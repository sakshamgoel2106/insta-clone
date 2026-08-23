import express from "express";
import { addComment, getComments, addReelComment, getReelComments } from "../controllers/comment.controller.js";
import { identifyuser } from "../middlewares/auth.middleware.js";

const commentRouter = express.Router();

commentRouter.post("/:postId/comment", identifyuser, addComment);
commentRouter.get("/:postId/comments", identifyuser, getComments);

// Reel comments
commentRouter.post("/reel/:reelId/comment", identifyuser, addReelComment);
commentRouter.get("/reel/:reelId/comments", identifyuser, getReelComments);

export default commentRouter;
