import dotenv from "dotenv";
import path from "path";

// Load environment variables from the src folder
dotenv.config({ path: path.join(__dirname, "../.env") });

export const NODE_ENV: "PROD" | "DEV" | "LOCAL" = "PROD";
export const JWT_SECRET = "xnova2023";

// MSG91 Configuration
export const MSG91_CONFIG = {
	AUTH_KEY: "460619AjLa366lN3hW68dfb79fP1",
	TEMPLATE_ID: "690768d9f9da3c48473908e3",
	SENDER_ID: "HOBIPL",
	BASE_URL: "https://control.msg91.com/api/v5"
};
// MSG91_AUTH_KEY=404360AuCkv4BTZfc64f718f3P1
// MSG91_TEMPLATE_ID=6616cf19d6fc05549771acc2
// MSG91_SENDER_ID=MSGIND
