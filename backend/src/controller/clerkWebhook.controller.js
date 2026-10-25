import User from '../model/User.model.js';
import { Webhook } from 'svix';

export const clerkWebhookHandler = async (req, res) => {
    try {
        console.log('--- RECEIVED CLERK WEBHOOK ---');

        let secret = process.env.CLERK_WEBHOOK_SECRET;
        if (!secret) {
            console.error('Error: CLERK_WEBHOOK_SECRET is missing');
            return res.status(500).json({ success: false, message: 'Webhook secret not configured' });
        }
        // Clean any accidental quotes or whitespace
        secret = secret.trim().replace(/^["'](.+)["']$/, '$1');

        // Ensure req.body is present and is a Buffer
        if (!req.body || !Buffer.isBuffer(req.body)) {
            console.error('Error: req.body is missing or not a Buffer.');
            return res.status(500).json({ success: false, message: 'Server configuration error: raw body expected' });
        }

        const wh = new Webhook(secret);
        let evt;

        try {
            // PASS req.body (Buffer) and req.headers DIRECTLY (Official Svix way)
            evt = wh.verify(req.body, req.headers);
            console.log('Svix verification SUCCESS. Event type:', evt?.type);
        } catch (err) {
            console.error('Svix signature verification failed:', err.message);
            return res.status(400).json({ success: false, message: `Verification failed: ${err.message}` });
        }

        if (!evt || !evt.type) {
            console.error('Error: Verified event is missing type property:', evt);
            return res.status(400).json({ success: false, message: 'Invalid webhook payload structure' });
        }

        const eventType = evt.type;
        const u = evt.data;

        console.log(`Processing Event Type: ${eventType} for User ID: ${u?.id}`);

        // Handle Database Sync
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