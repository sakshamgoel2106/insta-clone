import express from "express";
import { followUser , unfollowUser } from "../controllers/follow.controller.js";
import { identifyuser } from "../middlewares/auth.middleware.js";
const Userrouter = express.Router();


Userrouter.post("/follow/:username",identifyuser,followUser)

Userrouter.post("/unfollow/:username",identifyuser,unfollowUser)


export default Userrouter