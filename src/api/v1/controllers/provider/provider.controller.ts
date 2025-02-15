import { Request, Response } from "express";
import OrganizerModel from "../../../../models/organizer.model";

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
