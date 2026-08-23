import express from "express"
import { register, login, logout, getme, updateProfile, searchUsers, getUserProfile, toggleFollow } from "../controllers/auth.controller.js"
import {identifyuser} from "../middlewares/auth.middleware.js"
import multer from "multer";

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() });

router.post("/register", register)
router.post("/login", login)
router.get("/get-me",identifyuser,getme)
router.put("/profile", identifyuser, upload.single("profileImage"), updateProfile)
router.post("/logout", logout)

// New routes
router.get("/search", identifyuser, searchUsers)
router.get("/user/:username", identifyuser, getUserProfile)
router.post("/follow/:userId", identifyuser, toggleFollow)

export default router