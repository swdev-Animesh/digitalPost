import Message from '../model/Message.model.js';

export const getMessagesByUserId = async (req, res) => {
    try {
        const otherId = req.params.id;
        const userId = req.user._id;

        // Fetch messages where the current user is either the sender or receiver
        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: otherId },
                { senderId: otherId, receiverId: userId }
            ]
        }).sort({ createdAt: 1 }); // Sort messages by creation time in ascending order

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
