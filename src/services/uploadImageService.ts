import { PutObjectCommand } from "@aws-sdk/client-s3";
import { bucketName, s3Client, s3Url } from "../config/aws.config";

export const uploadImageToS3Service = async (key: string, thumbnailBuffer: Buffer) => {
	const photoKey = `${key}/${Date.now()}photo.png`;
	const command = new PutObjectCommand({
		Bucket: bucketName,
		Key: photoKey,
		Body: thumbnailBuffer,
		ACL: "public-read" // Set the ACL as needed (e.g., public-read for public access)
	});

	try {
		const response = await s3Client.send(command);
		console.log(response);
		if (response) {
			return `${s3Url}/${photoKey}`;
		}
		return null;
	} catch (err) {
		console.error(err);
	}
};
