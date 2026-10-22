import mongoose from "mongoose";

const MessageModel = new mongoose.Schema({
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    message:{
        type:String,
        default:""  ,
    },
    isRead:{
        type:Boolean,
        default:false,
    },
    imageMsg:{
        type:String,
        default:"",
    },
    videoMsg:{
        type:String,
        default:"",
    }

},
{timestamps:true},
);  

const Message = mongoose.model("Message",MessageModel);

export default Message;
