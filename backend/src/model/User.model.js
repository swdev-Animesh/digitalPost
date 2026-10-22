import mongoose from "mongoose";

const UserModel = new mongoose.Schema({
    name:{
        type:String,
        required:true,

    },
    profileImage:{
        type:String,
        default:"",
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    clerkId:{
        type:String,
        required:true,
        unique:true,
    }},
    {timestamps:true},
);

const User = mongoose.model("User",UserModel);

export default User;
    