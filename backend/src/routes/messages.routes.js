
import express from "express";
import { authProtectRoute } from "../middleware/authProtectRoute.middleware.js";

import { getAllUsers } from "../controller/getAllUsers.controller.js";
import { getUsersByConversations } from "../controller/getUsersByConversations.controller.js";
import { getMessagesByUserId } from "../controller/getMessagesByUserId.controller.js";
import { fileStorage } from "../middleware/fileUpload.middleware.js";
import { sendMessage } from "../controller/sendMessage.controller.js";
const router = express.Router();

//all routes are protected in this so we use middleware for this protected routes
router.use(authProtectRoute);
// Define your message routes here
router.get("/users", getAllUsers);
router.get("/users/chats", getUsersByConversations );
router.get("/messages/:id", getMessagesByUserId);
router.post("/send/:id", fileStorage.single("media") , sendMessage);

export default router;