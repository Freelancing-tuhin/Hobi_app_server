import dotenv from "dotenv";
import path from "path";
import { S3Client } from "@aws-sdk/client-s3";

// Ensure environment variables are loaded
dotenv.config({ path: path.join(__dirname, "../.env") });

const credential = {
	accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
};

export const s3Client = new S3Client({
	region: process.env.AWS_REGION || "us-east-1",
	credentials: credential
});

export const s3Url = process.env.AWS_S3_URL || "";

export const bucketName = process.env.AWS_S3_BUCKET || "";
