import mongoose from "mongoose";
import dotenv from "dotenv";


dotenv.config();

async function ConnectDB() {
    try {
        const URL = process.env.MONGO_URL;
        console.log("MongoDB URL:", URL); // Log the URL to check if it's being read correctly
        if(!URL){
            throw new Error("MONGO_URL is not defined in the environment variables");       
        }
        await mongoose.connect(URL);
        console.log("Connected to MongoDB");
        return mongoose;
    }catch(err){
        console.log("Error connecting to MongoDB:", err);
        throw err; // Rethrow the error to be handled by the caller
        process.exit(1); // Exit the process with an error code
    }

}
export async function disconnectFromMongoDB() {
  await mongoose.connection.close();
}
export default ConnectDB;