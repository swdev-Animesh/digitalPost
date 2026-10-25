import User from '../model/User.model.js';
import { verifyWebhook } from "@clerk/backend/webhooks";
export const clerkWebhookHandler = async (req, res) => {
    try{
      console.log('Received Clerk webhook event:');
        const secret = process.env.CLERK_WEBHOOK_SECRET;
        if(!secret){
            return res.status(500).json({error: "Webhook secret is not configured"});
        }
        const evt = await verifyWebhook(req, { secret });
        const eventType = evt.type;
        const u = evt.data;
        console.log(`Clerk Webhook Received: ${eventType} for User ID: ${u.id}`);
    // 6. Handle User Events & Sync MongoDB
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
            console.log(`User synced to MongoDB: ${name} (${email})`);
        }
    if (eventType === 'user.deleted') {
      await User.findOneAndDelete({ clerkId: u.id });
      console.log(`User deleted from MongoDB: ${u.id}`);
    }
    return res.status(200).json({
      success: true,
      message: `Successfully processed ${eventType}`,
    });
}catch(error){
     console.error('Database operation failed during webhook execution:', error);
    return res.status(500).json({
      success: false,
      message: 'Database error while processing webhook',
    });
}
};

