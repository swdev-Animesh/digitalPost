
import User from "../model/User.model.js";
import { verifyWebhook } from "@clerk/backend/webhooks";


export const clerkWebhookHandler = async (req, res) => {
  try {
    console.log("Received Clerk webhook event:");
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

    console.log("Webhook verified successfully:", evt);

    const eventType = evt.type;
    const u = evt.data; // <-- Correct: Clerk data lives directly here

    console.log(`Event Type: ${eventType}`);

    if (eventType === "user.created" || eventType === "user.updated") {
        const email =
            u.email_addresses?.find((e) => e.id === u.primary_email_address_id)?.email_address || 
            u.email_addresses?.[0]?.email_address || 
            "Unknown Email";

        const fullName = 
            [u.first_name, u.last_name].filter(Boolean).join(" ") || 
            u.username || 
            "Unknown User";
           
        console.log(`Syncing user -> Email: ${email}, Name: ${fullName}, Image: ${u.image_url}`);

        await User.findOneAndUpdate(
            { clerkId: u.id },
            { 
                clerkId: u.id, 
                email, 
                fullName, 
                profilePic: u.image_url 
            },
            { 
                returnDocument: 'after', 
                upsert: true, 
                setDefaultsOnInsert: true 
            }
        );
        console.log(`Successfully synced user to MongoDB: ${fullName} (${email})`);
    }

    if (eventType === "user.deleted") {
        if (u?.id) {
            await User.findOneAndDelete({ clerkId: u.id });
            console.log(`Successfully deleted user from MongoDB: ${u.id}`);
        }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error in Clerk webhook:", error);
    res.status(400).json({ message: "Webhook verification failed" });
  }
};

