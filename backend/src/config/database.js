import mongoose from "mongoose";

async function connectdb(){
    await mongoose.connect(process.env.MONGO_URI)
    console.log("connected to database to cluster1");
}

export default connectdb;