import User from '../model/User.model.js';
import { Webhook } from 'svix';

export const clerkWebhookHandler = async (req, res) => {
    try {
        console.log('--- RECEIVED CLERK WEBHOOK ---');

        const svix_id = req.headers['svix-id'];
        const svix_timestamp = req.headers['svix-timestamp'];
        const svix_signature = req.headers['svix-signature'];

        if (!svix_id || !svix_timestamp || !svix_signature) {
            console.error('Error: Missing Svix headers');
            return res.status(400).json({ success: false, message: 'Missing Svix headers' });
        }

        let secret = process.env.CLERK_WEBHOOK_SECRET;
        if (!secret) {
            console.error('Error: CLERK_WEBHOOK_SECRET is missing');
            return res.status(500).json({ success: false, message: 'Webhook secret not configured' });
        }
        secret = secret.trim().replace(/^["'](.+)["']$/, '$1');

        if (!Buffer.isBuffer(req.body)) {
            console.error('Error: req.body is not a Buffer.');
            return res.status(500).json({ success: false, message: 'Server configuration error: raw body expected' });
        }

        const payloadString = req.body.toString('utf8');

        // --- DEBUG LOGS FOR VERIFICATION ---
        console.log('Verifying with Svix...');
        console.log('Payload length:', payloadString.length);
        console.log('Headers:', { svix_id, svix_timestamp, svix_signature });

        const wh = new Webhook(secret);
        let evt;

        try {
            evt = wh.verify(payloadString, {
                'svix-id': svix_id,
                'svix-timestamp': svix_timestamp,
                'svix-signature': svix_signature,
            });
            console.log('Svix verification SUCCESS. Event object:', evt);
        } catch (err) {
            console.error('Svix signature verification threw an error:', err.message);
            return res.status(400).json({ success: false, message: `Verification failed: ${err.message}` });
        }

        // Safety check if evt is still undefined
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