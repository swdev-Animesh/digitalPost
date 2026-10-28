import {getAuth} from "@clerk/express";
import User from "../model/User.model.js";


export const authProtectRoute = async (req,res,next) => {
    try{
          const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    req.user = user;
    // If userId exists, proceed to the next middleware or route handler
    next();
    }catch(err){
        console.error("Error in protectedRoutes middleware:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
  
}