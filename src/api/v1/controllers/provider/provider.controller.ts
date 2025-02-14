import { Request, Response } from "express";
import ProviderModel from "../../../../models/organizer.model";

export const updatePastExperience = async (req: Request, res: Response) => {
	try {
		const { providerId } = req.query;
		const { past_experience } = req.body;

		if (!past_experience || !Array.isArray(past_experience)) {
			return res.status(400).json({
				message: "Invalid past_experience data. It should be an array."
			});
		}

		const updatedProvider = await ProviderModel.findByIdAndUpdate(
			providerId,
			{ $set: { past_experience } }, // Replaces the entire past_experience array
			{ new: true, runValidators: true }
		);

		if (!updatedProvider) {
			return res.status(404).json({
				message: "Provider not found"
			});
		}

		return res.status(200).json({
			message: "Past experience updated successfully",
			result: updatedProvider
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: "Failed to update past experience",
			error: error
		});
	}
};
