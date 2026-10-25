import User from '../model/User.model.js';
import { Webhook } from 'svix';

export const clerkWebhookHandler = async (req, res) => {
    try {
        console.log('--- RECEIVED CLERK WEBHOOK ---');

        // 1. Check for required Svix headers
        const svix_id = req.headers['svix-id'];
        const svix_timestamp = req.headers['svix-timestamp'];
        const svix_signature = req.headers['svix-signature'];

        if (!svix_id || !svix_timestamp || !svix_signature) {
            console.error('Error: Missing Svix headers');
            return res.status(400).json({ success: false, message: 'Missing Svix headers' });
        }

        // 2. Ensure webhook secret exists
        const secret = process.env.CLERK_SECRET_KEY;
        if (!secret) {
            console.error('Error: CLERK_SECRET_KEY is missing in environment variables');
            return res.status(500).json({ success: false, message: 'Webhook secret not configured' });
        }

        // 3. Get raw body payload (req.body must be a Buffer via express.raw)
        if (!Buffer.isBuffer(req.body)) {
            console.error('Error: req.body is not a Buffer. Did you forget express.raw() middleware?');
            return res.status(500).json({ success: false, message: 'Server configuration error: raw body expected' });
        }

        const payloadString = req.body.toString('utf8');

        // 4. Verify signature using Svix
        const wh = new Webhook(secret);
        let evt;

        try {
            evt = wh.verify(payloadString, {
                'svix-id': svix_id,
                'svix-timestamp': svix_timestamp,
                'svix-signature': svix_signature,
            });
        } catch (err) {
            console.error('Svix signature verification failed:', err.message);
            return res.status(400).json({ success: false, message: `Verification failed: ${err.message}` });
        }

        const eventType = evt.type;
        const u = evt.data;

        console.log(`Verified Webhook Event Type: ${eventType} for User ID: ${u.id}`);

        // 5. Handle Database Sync
        if (eventType === 'user.created' || eventType === 'user.updated') {
            const email =
                u.email_addresses?.find((e) => e.id === u.primary_email_address_id)?.email_address ??
                u.email_addresses?.[0]?.email_address;

            const name =
                [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username || email?.split("@")[0];

            await User.findOneAndUpdate(
                { clerkId: u.id },
                { clerkId: u.id, email, name, profileImage: u.image_url },
                { new: true, upsert: true, setDefaultsOnInsert: true },
            );
            console.log(`Successfully synced user to MongoDB: ${name} (${email})`);
        }

        if (eventType === 'user.deleted') {
            await User.findOneAndDelete({ clerkId: u.id });
            console.log(`Successfully deleted user from MongoDB: ${u.id}`);
        }

        return res.status(200).json({
            success: true,
            message: `Successfully processed ${eventType}`,
        });

    } catch (error) {
        console.error('Unexpected error during webhook execution:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during webhook processing',
        });
    }
};

















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


// import User from "../model/User.model.js";
// import { verifyWebhook } from "@clerk/backend/webhooks";

//  export const clerkWebhookHandler = async (req, res) => {
//   try {

//     console.log("Received Clerk webhook event:");
//     const signingSecret = process.env.CLERK_WEBHOOK_SECRET;
//      console.log(signingSecret, "1231243123signingSecret");
//     if (!signingSecret) {
//       res.status(503).json({ message: "Webhook secret is not provided" });
//       return;
//     }

//     // clerk's verifier expects a Web Request with the raw body; express.raw gives a Buffer.
//     const payload = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : String(req.body);
//     const request = new Request("http://internal/webhooks/clerk", {
//       method: "POST",
//       headers: new Headers(req.headers),
//       body: payload,
//     });
//     console.log("Request prepared for Clerk webhook verification:", request);
//     // throws if the signature is wrong or the body was tampered with; only then do we trust evt.
//     const evt = await verifyWebhook(request, { signingSecret });
//     console.log(`Clerk Webhook Received: ${evt.type} for User ID: ${evt.data.id}`);


//     if (evt.type === "user.created" || evt.type === "user.updated") {
//       const u = evt.data;

//       const email =
//         u.email_addresses?.find((e) => e.id === u.primary_email_address_id)?.email_address ??
//         u.email_addresses?.[0]?.email_address;

//       const fullName =
//         [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username || email?.split("@")[0];

//       await User.findOneAndUpdate(
//         { clerkId: u.id },
//         { clerkId: u.id, email, fullName, profilePic: u.image_url },
//         { new: true, upsert: true, setDefaultsOnInsert: true },
//       );
//     }

//     if (evt.type === "user.deleted") {
//       if (evt.data.id) await User.findOneAndDelete({ clerkId: evt.data.id });
//     }

//     res.status(200).json({ received: true });
//   } catch (error) {
//     console.error("Error in Clerk webhook:", error);
//     res.status(400).json({ message: "Webhook verification failed" });
//   }
// };

