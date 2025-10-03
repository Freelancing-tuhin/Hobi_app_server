import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const NODE_ENV: "PROD" | "DEV" | "LOCAL" = "LOCAL";
export const JWT_SECRET = "xnova2023";

// MSG91 Configuration
export const MSG91_CONFIG = {
	AUTH_KEY: process.env.MSG91_AUTH_KEY || "404360AuCkv4BTZfc64f718f3P1",
	TEMPLATE_ID: process.env.MSG91_TEMPLATE_ID || "6616cf19d6fc05549771acc2",
	SENDER_ID: process.env.MSG91_SENDER_ID || "MSGIND",
	BASE_URL: "https://control.msg91.com/api/v5"
};
