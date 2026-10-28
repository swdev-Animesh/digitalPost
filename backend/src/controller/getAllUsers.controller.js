import User from "../model/User.model.js";
export const getAllUsers = async (req, res) => {
    try{
        const userClient = req.user._id ;
        const allUsers = await User.find({ _id: { $ne: userClient } }).select("-clerkId");   
        
        res.status(200).json(allUsers);
    }catch(error){
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
