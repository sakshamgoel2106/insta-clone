import express from "express";
import multer from "multer";
import { createReel, getAllReels } from "../controllers/reel.controller.js";
import { identifyuser } from "../middlewares/auth.middleware.js";

const reelRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

reelRouter.post("/", upload.single("file"), identifyuser, createReel);
reelRouter.get("/", identifyuser, getAllReels);

export default reelRouter;
