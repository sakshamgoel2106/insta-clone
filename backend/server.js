import app from "./src/app.js";
import dotenv from "dotenv";
dotenv.config();
import connectdb from "./src/config/database.js";
connectdb();

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});