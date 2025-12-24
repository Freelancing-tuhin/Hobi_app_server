import { PutObjectCommand } from "@aws-sdk/client-s3";
import { bucketName, s3Client, s3Url } from "../config/aws.config";

/**
 * Uploads a PDF file to S3 and returns the file URL.
 * @param {string} key - The S3 key for storing the PDF.
 * @param {Buffer} pdfBuffer - The buffer containing the PDF data.
 * @returns {string|null} - The URL of the uploaded PDF or null if failed.
 */
export const uploadPdfToS3Service = async (key: string, pdfBuffer: Buffer) => {
	const pdfKey = `${key}/${Date.now()}.pdf`;
	const command = new PutObjectCommand({
		Bucket: bucketName,
		Key: pdfKey,
		Body: pdfBuffer,
		ContentType: "application/pdf", // Specify that this is a PDF file
		ACL: "public-read" // Adjust the ACL if needed
	});

	try {
		const response = await s3Client.send(command);
		if (response) {
			return `${s3Url}/${pdfKey}`;
		}
		return null;
	} catch (err) {
		console.error("Failed to upload PDF to S3:", err);
		return null;
	}
};
