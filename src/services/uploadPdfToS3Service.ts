import cloudinary, { uploadPreset } from "../config/cloudinary.config";

/**
 * Uploads a PDF file to Cloudinary and returns the file URL.
 * @param {string} key - The folder path for storing the PDF.
 * @param {Buffer} pdfBuffer - The buffer containing the PDF data.
 * @returns {Promise<string|null>} - The URL of the uploaded PDF or null if failed.
 */
export const uploadPdfToS3Service = async (key: string, pdfBuffer: Buffer): Promise<string | null> => {
	try {
		// Convert buffer to base64 data URI
		const base64Pdf = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;

		const result = await cloudinary.uploader.upload(base64Pdf, {
			folder: key,
			upload_preset: uploadPreset,
			resource_type: "raw", // Use 'raw' for non-image files like PDFs
			public_id: `${Date.now()}`,
			format: "pdf"
		});

		console.log("Cloudinary PDF upload response:", result);

		if (result && result.secure_url) {
			return result.secure_url;
		}
		return null;
	} catch (err) {
		console.error("Failed to upload PDF to Cloudinary:", err);
		return null;
	}
};
