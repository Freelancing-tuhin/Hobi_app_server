import cloudinary, { uploadPreset } from "../config/cloudinary.config";

/**
 * Uploads an image to Cloudinary and returns the file URL.
 * @param {string} key - The folder path for storing the image.
 * @param {Buffer} imageBuffer - The buffer containing the image data.
 * @returns {Promise<string|null>} - The URL of the uploaded image or null if failed.
 */
export const uploadImageToS3Service = async (key: string, imageBuffer: Buffer): Promise<string | null> => {
	try {
		// Convert buffer to base64 data URI
		const base64Image = `data:image/png;base64,${imageBuffer.toString("base64")}`;

		const result = await cloudinary.uploader.upload(base64Image, {
			folder: key,
			upload_preset: uploadPreset,
			resource_type: "image",
			public_id: `${Date.now()}photo`
		});

		console.log("Cloudinary upload response:", result);

		if (result && result.secure_url) {
			return result.secure_url;
		}
		return null;
	} catch (err) {
		console.error("Failed to upload image to Cloudinary:", err);
		return null;
	}
};
