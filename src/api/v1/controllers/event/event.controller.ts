import { Request, Response } from "express";
import EventModel from "../../../../models/event.model";
import { MESSAGE } from "../../../../constants/message";
import { uploadImageToS3Service } from "../../../../services/uploadImageService";
import mongoose from "mongoose";

export const createEvent = async (req: Request, res: Response) => {
	try {
		const eventDetails = req.body;

		if (!req.files || !("banner_Image" in req.files)) {
			return res.status(404).json({
				message: MESSAGE.post.custom("banner_Image not found")
			});
		}
		const banner_Image = req.files["banner_Image"][0];
		const banner_Image_Buffer = banner_Image.buffer;
		let banner_Image_Url: any = "";
		try {
			banner_Image_Url = (await uploadImageToS3Service("banner_Image", banner_Image_Buffer)) || "";
		} catch (error) {
			return res.status(400).json({
				message: MESSAGE.post.fail
			});
		}
		const payload = {
			...eventDetails,
			banner_Image: banner_Image_Url
		};
		const newEvent = await new EventModel(payload).save();

		return res.status(200).json({
			message: MESSAGE.post.succ,
			result: newEvent
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			message: MESSAGE.post.fail,
			error
		});
	}
};

export const editEvent = async (req: Request, res: Response) => {
	try {
		const eventDetails = req.body;
		const eventId = req.query.eventId as string; // Extract eventId from query params
		console.log("Raw Request Body:", req.body);

		// Validate eventId
		if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
			return res.status(400).json({
				message: MESSAGE.patch.custom("Invalid or missing Event ID")
			});
		}

		console.log("Updating event with ID:", eventId);
		console.log("Update details:", eventDetails);

		// Update event details (excluding banner image)
		const updatedEvent = await EventModel.findByIdAndUpdate(eventId, eventDetails, {
			new: true,
			runValidators: true
		}).exec(); // Ensures query execution

		if (!updatedEvent) {
			return res.status(404).json({
				message: MESSAGE.patch.custom("Event not found")
			});
		}

		return res.status(200).json({
			message: MESSAGE.patch.succ,
			result: updatedEvent
		});
	} catch (error) {
		console.error("Error updating event:", error);
		return res.status(500).json({
			message: MESSAGE.patch.fail,
			error
		});
	}
};

// Separate function to update only the banner image
export const updateEventBanner = async (req: Request, res: Response) => {
	try {
		const eventId = String(req.query.eventId); // Extract eventId from query params

		if (!eventId) {
			return res.status(400).json({
				message: MESSAGE.patch.custom("Event ID is required")
			});
		}

		if (!req.files || !("banner_Image" in req.files)) {
			return res.status(404).json({
				message: MESSAGE.patch.custom("banner_Image not found")
			});
		}

		const banner_Image = req.files["banner_Image"][0];
		const banner_Image_Buffer = banner_Image.buffer;
		let banner_Image_Url: any = "";

		try {
			banner_Image_Url = (await uploadImageToS3Service("banner_Image", banner_Image_Buffer)) || "";
		} catch (error) {
			return res.status(400).json({
				message: MESSAGE.patch.fail
			});
		}

		const updatedEvent = await EventModel.findByIdAndUpdate(
			eventId,
			{ banner_Image: banner_Image_Url },
			{ new: true }
		);

		if (!updatedEvent) {
			return res.status(404).json({
				message: MESSAGE.patch.custom("Event not found")
			});
		}

		return res.status(200).json({
			message: MESSAGE.patch.succ,
			result: updatedEvent
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			message: MESSAGE.patch.fail,
			error
		});
	}
};
