import { Request, Response } from "express";
import OrganizerModel from "../../../../models/organizer.model";
import { MESSAGE } from "../../../../constants/message";
import { uploadImageToS3Service } from "../../../../services/uploadImageService";

export const updateOrganizerDetails = async (req: Request, res: Response) => {
	try {
		const { organizerId } = req.query;
		const organizerData = req.body;

		const updatedProvider = await OrganizerModel.findByIdAndUpdate(
			organizerId,
			{ $set: organizerData }, // Correctly applies dynamic updates
			{ new: true, runValidators: true }
		);

		if (!updatedProvider) {
			return res.status(404).json({
				message: "Provider not found"
			});
		}

		return res.status(200).json({
			message: "Organizer details updated successfully",
			result: updatedProvider
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: "Failed to update organizer details",
			error: error
		});
	}
};

export const updateOrganizerDocuments = async (req: any, res: Response) => {
	try {
		const { organizerId } = req.query;

		if (!req.files) {
			return res.status(400).json({ message: "No files uploaded" });
		}

		// Define the fields that should be updated with uploaded files
		const fileFields = [
			"licenses_for_establishment",
			"certificate_of_incorporation",
			"licenses_for_activity_undertaken",
			"certifications",
			"insurance_for_outdoor_activities",
			"health_safety_documents"
		];

		// Process each file field dynamically
		const organizerData: Record<string, any> = {};

		for (const field of fileFields) {
			if (req.files[field]) {
				try {
					const fileBuffer = req.files[field][0].buffer;
					const fileUrl = await uploadImageToS3Service(field, fileBuffer);
					organizerData[field] = fileUrl || "";
				} catch (error) {
					return res.status(400).json({ message: `Failed to upload ${field}` });
				}
			}
		}

		// Update the organizer document
		const updatedProvider = await OrganizerModel.findByIdAndUpdate(
			organizerId,
			{ $set: organizerData },
			{ new: true, runValidators: true }
		);

		if (!updatedProvider) {
			return res.status(404).json({ message: "Provider not found" });
		}

		return res.status(200).json({
			message: "Organizer documents updated successfully",
			result: updatedProvider
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: "Failed to update organizer documents",
			error: error
		});
	}
};
