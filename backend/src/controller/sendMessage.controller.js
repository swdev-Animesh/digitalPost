import Message from "../model/Message.model.js";
import { hasImageKitConfig, uploadChatMedia } from "../lib/imagekit.js";
import { io, getReceiverSocketId } from "../lib/socket.js";
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.id;
    let vid = "";
    let img = "";
    let msg = "";
    if (req.body.message !== null) {
      msg = req.body.message;
    }
    if (req.file) {
      if (!hasImageKitConfig()) {
        return res
          .status(500)
          .json({ message: "Media upload is not configured" });
      }
      if (req.file.mimeType.startsWith("video")) {
        vid = req.file;
        vid = uploadChatMedia(vid);
      } else {
        img = req.file;
        img = uploadChatMedia(img);
      }
    }

    // Create a new message document
    const newMessage = new Message({
      senderId,
      receiverId,
      message: msg,
      imageUrl: img,
      videoUrl: vid,
    });

    // Save the message to the database
    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    // only send the message in realtime if user is online
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res
      .status(201)
      .json({ message: "Message sent successfully", data: newMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
