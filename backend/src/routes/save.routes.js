import express from "express";
import { toggleSave, getSavedPosts, getSavedPostIds } from "../controllers/save.controller.js";
import { identifyuser } from "../middlewares/auth.middleware.js";

const saveRouter = express.Router();

saveRouter.post("/:postId", identifyuser, toggleSave);
saveRouter.get("/", identifyuser, getSavedPosts);
saveRouter.get("/ids", identifyuser, getSavedPostIds);

export default saveRouter;
