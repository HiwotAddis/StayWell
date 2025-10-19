import express, { json } from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import clerkWebhooks from "./controllers/clerkWebhooks.js";

connectDB();

const app = express();
app.use(cors()); // Enable Cross-Origin Resource Sharing

// Middleware
app.use(express.json());

// API to listen to Clerk Webhooks (exclude from auth middleware)
app.use("/api/clerk", clerkWebhooks);

// Apply Clerk middleware to all other routes
app.use(clerkMiddleware());

app.get("/", (req, res) => {
  res.send("API is working ");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
