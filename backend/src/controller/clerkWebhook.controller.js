// import User from '../model/User.model.js';
// import { verifyWebhook } from "@clerk/backend/webhooks";
// export const clerkWebhookHandler = async (req, res) => {
//     try{
//       console.log('Received Clerk webhook event:');
//         const secret = process.env.CLERK_WEBHOOK_SECRET;
//         if(!secret){
//             return res.status(500).json({error: "Webhook secret is not configured"});
//         }

//         const evt = await verifyWebhook(req, { secret });
//         const eventType = evt.type;
//         const u = evt.data;
//         console.log(`Clerk Webhook Received: ${eventType} for User ID: ${u.id}`);
//     // 6. Handle User Events & Sync MongoDB
//     if (eventType === 'user.created' || eventType === 'user.updated') {
//             const email =
//                 u.email_addresses?.find((e) => e.id === u.primary_email_address_id)?.email_address ??
//                 u.email_addresses?.[0]?.email_address;

//             const name =
//                 [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username || email?.split("@")[0];

//             await User.findOneAndUpdate(
//                 { clerkId: u.id },
//                 { clerkId: u.id, email, name, profileImage: u.image_url },
//                 { new: true, upsert: true, setDefaultsOnInsert: true },
//             );
//             console.log(`User synced to MongoDB: ${name} (${email})`);
//         }
//     if (eventType === 'user.deleted') {
//       await User.findOneAndDelete({ clerkId: u.id });
//       console.log(`User deleted from MongoDB: ${u.id}`);
//     }
//     return res.status(200).json({
//       success: true,
//       message: `Successfully processed ${eventType}`,
//     });
// }catch(error){
//      console.error('Database operation failed during webhook execution:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Database error while processing webhook',
//     });
// }
// };


import User from "../models/user.model.js";
import { verifyWebhook } from "@clerk/backend/webhooks";

 export const clerkWebhookHandler = async (req, res) => {
  try {
    const signingSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!signingSecret) {
      res.status(503).json({ message: "Webhook secret is not provided" });
      return;
    }

    // clerk's verifier expects a Web Request with the raw body; express.raw gives a Buffer.
    const payload = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : String(req.body);
    const request = new Request("http://internal/webhooks/clerk", {
      method: "POST",
      headers: new Headers(req.headers),
      body: payload,
    });

    // throws if the signature is wrong or the body was tampered with; only then do we trust evt.
    const evt = await verifyWebhook(request, { signingSecret });
    console.log(`Clerk Webhook Received: ${evt.type} for User ID: ${evt.data.id}`);


    if (evt.type === "user.created" || evt.type === "user.updated") {
      const u = evt.data;

      const email =
        u.email_addresses?.find((e) => e.id === u.primary_email_address_id)?.email_address ??
        u.email_addresses?.[0]?.email_address;

      const fullName =
        [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username || email?.split("@")[0];

      await User.findOneAndUpdate(
        { clerkId: u.id },
        { clerkId: u.id, email, fullName, profilePic: u.image_url },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );
    }

    if (evt.type === "user.deleted") {
      if (evt.data.id) await User.findOneAndDelete({ clerkId: evt.data.id });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error in Clerk webhook:", error);
    res.status(400).json({ message: "Webhook verification failed" });
  }
};

