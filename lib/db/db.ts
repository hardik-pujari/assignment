import mongoose from "mongoose";
let connected = false;
export const connectToDB = async () => {
    if (connected) {
        console.log("Already connected to MongoDB");
        return;
    }
    try {
        await mongoose.connect(process.env.MONGODB_URI || "");
        connected = true ;
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};