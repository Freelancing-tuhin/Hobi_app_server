import { Request, Response } from "express";
import { MESSAGE } from "../../../../constants/message";
import OrganizerModel from "../../../../models/organizer.model";
import EventModel from "../../../../models/event.model";

export const getAllOrganizers = async (req: Request, res: Response) => {
	try {
		const { page = 1, limit = 10, search = "" } = req.query;

		const skip = (Number(page) - 1) * Number(limit);

		// Regex pattern for case-insensitive search
		const searchQuery = search
			? {
					$or: [
						{ full_name: { $regex: search, $options: "i" } },
						{ phone: { $regex: search, $options: "i" } },
						{ email: { $regex: search, $options: "i" } }
					]
			  }
			: {};

		const organizers = await OrganizerModel.find(searchQuery).skip(skip).limit(Number(limit)).lean(); // Using lean() for better performance

		// Fetch total events count for each organizer
		const organizersWithEventCounts = await Promise.all(
			organizers.map(async (organizer) => {
				const eventCount = await EventModel.countDocuments({ organizerId: organizer._id });
				return { ...organizer, totalEvents: eventCount };
			})
		);

		const totalOrganizers = await OrganizerModel.countDocuments(searchQuery);

		return res.status(200).json({
			message: MESSAGE.get.succ,
			result: organizersWithEventCounts,
			pagination: {
				total: totalOrganizers,
				currentPage: Number(page),
				totalPages: Math.ceil(totalOrganizers / Number(limit)),
				limit: Number(limit)
			}
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			message: MESSAGE.get.fail,
			error
		});
	}
};

export const editOrganizers = async (req: Request, res: Response) => {
	try {
		const { id } = req.query;
		const updateData = req.body;

		const updatedProvider = await OrganizerModel.findByIdAndUpdate(id, updateData, {
			new: true,
			runValidators: true
		});

		if (!updatedProvider) {
			return res.status(404).json({
				message: MESSAGE.patch.fail,
				error: "Provider not found"
			});
		}

		return res.status(200).json({
			message: MESSAGE.patch.succ,
			result: updatedProvider
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			message: MESSAGE.patch.fail,
			error
		});
	}
};

export const deleteProvider = async (req: Request, res: Response) => {
	try {
		const { id } = req.query;

		const deletedProvider = await OrganizerModel.findByIdAndDelete(id);

		if (!deletedProvider) {
			return res.status(404).json({
				message: MESSAGE.delete.fail,
				error: "Provider not found"
			});
		}

		return res.status(200).json({
			message: MESSAGE.delete.succ,
			result: deletedProvider
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			message: MESSAGE.delete.fail,
			error
		});
	}
};

export const getOrganizerById = async (req: Request, res: Response) => {
	try {
		const { id } = req.query;

		if (!id) {
			return res.status(400).json({
				message: MESSAGE.get.fail,
				error: "Organizer ID is required"
			});
		}

		const organizer = await OrganizerModel.findById(id);

		if (!organizer) {
			return res.status(404).json({
				message: MESSAGE.get.fail,
				error: "Organizer not found"
			});
		}

		return res.status(200).json({
			message: MESSAGE.get.succ,
			result: organizer
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			message: MESSAGE.get.fail,
			error
		});
	}
};
