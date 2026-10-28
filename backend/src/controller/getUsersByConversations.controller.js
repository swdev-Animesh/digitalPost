
import  Message  from "../model/Message.model.js";

 export const getUsersByConversations = async (req, res) => {
  try {
  
    const currentUserId = req.user._id;

    // 3. Run MongoDB Aggregation Pipeline
    const conversations = await Message.aggregate([
      // Step A: Find all messages where the current user is either sender or receiver
      {
        $match: {
          $or: [
            { senderId: currentUserId },
            { receiverId: currentUserId }
          ]
        }
      },
      // Step B: Sort messages by newest first
      {
        $sort: { createdAt: -1 }
      },
      // Step C: Determine who the "other" user is in each message
      {
        $project: {
          otherUserId: {
            $cond: {
              if: { $eq: ["$senderId", currentUserId] },
              then: "$receiverId",
              else: "$senderId"
            }
          },
          createdAt: 1
        }
      },
      // Step D: Group by the other user to get unique conversation partners, keeping the latest timestamp
      {
        $group: {
          _id: "$otherUserId",
          lastMessageTime: { $first: "$createdAt" }
        }
      },
      // Step E: Sort unique conversations by the latest message time (newest chat on top)
      {
        $sort: { lastMessageTime: -1 }
      },
      // Step F: Join with the users collection to fetch name and profile image
      {
        $lookup: {
          from: "users", // MongoDB collection name for users (usually lowercase plural)
          localField: "_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      // Step G: Unwind the userInfo array into an object
      {
        $unwind: "$userInfo"
      },
      // Step H: Project only the fields needed for the sidebar (prevents bloat)
      {
        $project: {
          _id: "$userInfo._id",
          name: "$userInfo.name",
          profileImg: "$userInfo.profileImg",
          lastMessageTime: 1
        }
      }
    ]);

    // 4. Return the clean list for the sidebar
    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error fetching chat sidebar:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

