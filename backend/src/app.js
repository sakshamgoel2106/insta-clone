import express from "express";
import cookieParser from "cookie-parser";
import router from "./routes/auth.routes.js";
import Postrouter from "./routes/post.routes.js";
import Userrouter from "./routes/follow.routes.js";
import commentRouter from "./routes/comment.routes.js";
import saveRouter from "./routes/save.routes.js";
import reelRouter from "./routes/reel.routes.js";
import cors from "cors";

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));

app.use("/api/auth", router);
app.use("/api/post", Postrouter);
app.use("/api/user", Userrouter);
app.use("/api/post", commentRouter);
app.use("/api/save", saveRouter);
app.use("/api/reel", reelRouter);

export default app;