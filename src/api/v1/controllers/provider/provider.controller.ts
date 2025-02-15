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

export const updateOrganizerDocuments = async (req: Request, res: Response) => {
	try {
		const { organizerId } = req.query;

		if (!req.files || !("licenses_for_establishment" in req.files)) {
			return res.status(404).json({
				message: MESSAGE.post.custom("licenses_for_establishment not found")
			});
		}

		const licenses_for_establishment = req.files["licenses_for_establishment"][0];
		const licenses_for_establishmentBuffer = licenses_for_establishment.buffer;
		let licenses_for_establishment_Url: any = "";
		try {
			licenses_for_establishment_Url =
				(await uploadImageToS3Service("licenses_for_establishment", licenses_for_establishmentBuffer)) || "";
		} catch (error) {
			return res.status(400).json({
				message: MESSAGE.post.fail
			});
		}

		const organizerData = {
			licenses_for_establishment: licenses_for_establishment_Url
			// certificate_of_incorporation: ,
			// licenses_for_activity_undertaken: ,
			// certifications: ,
			// insurance_for_outdoor_activities: ,
			// health_safety_documents:
		};
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
