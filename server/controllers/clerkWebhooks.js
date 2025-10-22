import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
    try {
        console.log("Webhook received:", {
            method: req.method,
            headers: {
                "svix-id": req.headers["svix-id"],
                "svix-timestamp": req.headers["svix-timestamp"],
                "svix-signature": req.headers["svix-signature"] ? "present" : "missing"
            },
            body: req.body
        });

        // Check if webhook secret is configured
        if (!process.env.CLERK_WEBHOOK_SECRET) {
            throw new Error("CLERK_WEBHOOK_SECRET environment variable is not set");
        }

        // Create a Svix instance with clerk webhook secret.
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

        // Getting Headers
        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        };

        // Verifying Headers
        await whook.verify(JSON.stringify(req.body), headers);

        // Getting Data from request body
        const { data, type } = req.body;

        console.log("Processing webhook event:", { type, userId: data?.id });

        if (!type || !data || !data.id) {
            throw new Error("Invalid webhook payload: missing type or data.id");
        }

        // Switch cases for different events
        switch (type) {
            case "user.created": {
                const primaryEmail = data.email_addresses?.[0]?.email_address;
                const createdUser = {
                    _id: data.id,
                    email: primaryEmail,
                    username: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
                    image: data.image_url,
                };
                console.log("Creating user:", { _id: createdUser._id, email: createdUser.email });
                await User.create(createdUser);
                break;
            }
            case "user.updated": {
                const update = {};
                if (data.first_name || data.last_name) {
                    update.username = `${data.first_name || ""} ${data.last_name || ""}`.trim();
                }
                if (data.image_url) {
                    update.image = data.image_url;
                }
                if (data.email_addresses?.[0]?.email_address) {
                    update.email = data.email_addresses[0].email_address;
                }
                console.log("Updating user:", { _id: data.id, updateFields: Object.keys(update) });
                if (Object.keys(update).length > 0) {
                    await User.findByIdAndUpdate(data.id, update, { new: true });
                }
                break;
            }
            case "user.deleted": {
                console.log("Deleting user:", data.id);
                await User.findByIdAndDelete(data.id);
                break;
            }
                
            default:
                console.log("Unhandled webhook event type:", type);
                break;
        }
        
        console.log("Webhook processed successfully");
        res.json({success: true, message: "Webhook Received"});

    } catch (error) {
        console.error("Webhook error:", {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({success: false, message: error.message});
    }
}

export default clerkWebhooks;