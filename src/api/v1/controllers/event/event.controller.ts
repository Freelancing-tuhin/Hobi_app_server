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

export const getFilteredEvents = async (req: Request, res: Response) => {
	try {
		const filters = { ...req.query };
		const page = parseInt(req.query.page as string) || 1; // Default page = 1
		const limit = parseInt(req.query.limit as string) || 10; // Default limit = 10
		const skip = (page - 1) * limit;

		// Remove pagination parameters from filters
		delete filters.page;
		delete filters.limit;

		console.log("Filters received:", filters);
		console.log(`Pagination - Page: ${page}, Limit: ${limit}`);

		// Find total matching events count
		const totalEvents = await EventModel.countDocuments(filters);

		// Find events with pagination
		const events = await EventModel.find(filters).skip(skip).limit(limit);

		// Check if events exist
		if (!events.length) {
			return res.status(404).json({
				message: MESSAGE.get.custom("No events found matching the criteria"),
				result: [],
				totalPages: Math.ceil(totalEvents / limit),
				currentPage: page
			});
		}

		return res.status(200).json({
			message: MESSAGE.get.succ,
			totalPages: Math.ceil(totalEvents / limit),
			currentPage: page,
			totalEvents,
			result: events
		});
	} catch (error) {
		console.error("Error fetching events:", error);
		return res.status(400).json({
			message: MESSAGE.get.fail,
			error
		});
	}
};

export const getUpcomingEvents = async (req: Request, res: Response) => {
	try {
		const currentDateTime = new Date(); // Get current date & time
		console.log("Fetching upcoming events. Current time:", currentDateTime);

		// Pagination parameters
		const page = parseInt(req.query.page as string) || 1; // Default page = 1
		const limit = parseInt(req.query.limit as string) || 10; // Default limit = 10
		const skip = (page - 1) * limit;

		// Fetch all events first (since date fields are stored as strings)
		const events = await EventModel.find();

		// Filter only upcoming events
		const upcomingEvents = events.filter((event) => {
			const eventDateTime = new Date(`${event.startDate}T${event.startTime}:00`); // Convert to Date object
			return eventDateTime > currentDateTime; // Ensure it's strictly in the future
		});

		// Sort events by earliest event first
		upcomingEvents.sort((a, b) => {
			const dateA = new Date(`${a.startDate}T${a.startTime}:00`);
			const dateB = new Date(`${b.startDate}T${b.startTime}:00`);
			return dateA.getTime() - dateB.getTime();
		});

		// Pagination logic
		const totalEvents = upcomingEvents.length;
		const paginatedEvents = upcomingEvents.slice(skip, skip + limit);

		// If no upcoming events are found
		if (!paginatedEvents.length) {
			return res.status(404).json({
				message: MESSAGE.get.custom("No upcoming events found"),
				result: [],
				totalPages: Math.ceil(totalEvents / limit),
				currentPage: page
			});
		}

		return res.status(200).json({
			message: MESSAGE.get.succ,
			totalPages: Math.ceil(totalEvents / limit),
			currentPage: page,
			totalEvents,
			result: paginatedEvents
		});
	} catch (error) {
		console.error("Error fetching upcoming events:", error);
		return res.status(400).json({
			message: MESSAGE.get.fail,
			error
		});
	}
};

export const deleteEvent = async (req: Request, res: Response) => {
	try {
		const eventId = req.query.eventId as string; // Extract eventId from query params

		// Validate eventId
		if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
			return res.status(400).json({
				message: MESSAGE.delete.custom("Invalid or missing Event ID")
			});
		}

		console.log("Deleting event with ID:", eventId);

		// Find and delete the event
		const deletedEvent = await EventModel.findByIdAndDelete(eventId).exec();

		// If event not found
		if (!deletedEvent) {
			return res.status(404).json({
				message: MESSAGE.delete.custom("Event not found")
			});
		}

		return res.status(200).json({
			message: MESSAGE.delete.succ,
			result: deletedEvent // Optional: Return the deleted event details
		});
	} catch (error) {
		console.error("Error deleting event:", error);
		return res.status(500).json({
			message: MESSAGE.delete.fail,
			error
		});
	}
};
