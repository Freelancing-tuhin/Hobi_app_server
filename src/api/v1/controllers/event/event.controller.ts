import { Request, Response } from "express";
import EventModel from "../../../../models/event.model";
import { MESSAGE } from "../../../../constants/message";
import { uploadImageToS3Service } from "../../../../services/uploadImageService";
import mongoose from "mongoose";
import { createNotification } from "../../../../types/interface/notifications";

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

		// Parse tickets array safely
		let tickets: any = [];
		if (eventDetails.tickets) {
			try {
				const parsedTickets = JSON.parse(eventDetails.tickets); // Ensure it's an array
				if (Array.isArray(parsedTickets)) {
					tickets = parsedTickets.map((ticket) => ({
						ticketName: ticket.ticketName || null,
						ticketPrice: ticket.ticketPrice || 0,
						quantity: ticket.quantity || 0
					}));
				}
			} catch (error) {
				return res.status(400).json({
					message: "Invalid tickets format, must be a valid JSON array"
				});
			}
		}

		const payload = {
			...eventDetails,
			verified: false,
			banner_Image: banner_Image_Url,
			tickets
		};

		const newEvent = await new EventModel(payload).save();
		await newEvent.populate([
			{ path: "organizerId", select: "full_name email" },
			{ path: "category", select: "service_name" }
		]);

		await createNotification(
			"Event Created",
			"A ripple in the stream, a sudden bloom of possibility. A fresh chapter opens: new event created.",
			newEvent?._id,
			"id",
			newEvent?.organizerId,
			"organizers",
			`${newEvent?._id}`,
			"events"
		);

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
		})
			.populate("organizerId", "full_name email")
			.populate("category", "service_name")
			.exec();

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

export const getUpcomingEvents = async (req: Request, res: Response) => {
	try {
		const currentDateTime = new Date(); // Get current date & time
		console.log("Fetching upcoming events. Current time:", currentDateTime);

		// Extract pagination and filter parameters
		const { search, page = "1", limit = "10", category, type, organizerId, isTicketed, verified, ...otherFilters } = req.query;

		const pageNum = parseInt(page as string, 10) || 1;
		const limitNum = parseInt(limit as string, 10) || 10;
		const skip = (pageNum - 1) * limitNum;

		// Build query filters
		const queryFilters: any = {};

		// Search by title (case-insensitive)
		if (search) {
			queryFilters.title = { $regex: search, $options: "i" };
		}

		// Filter by category
		if (category) {
			queryFilters.category = category;
		}

		// Filter by event type (Single/Recurring)
		if (type) {
			queryFilters.type = type;
		}

		// Filter by organizerId
		if (organizerId && mongoose.Types.ObjectId.isValid(organizerId as string)) {
			queryFilters.organizerId = new mongoose.Types.ObjectId(organizerId as string);
		}

		// Filter by isTicketed
		if (isTicketed !== undefined) {
			queryFilters.isTicketed = isTicketed === "true";
		}

		// Filter by verified status
		if (verified !== undefined) {
			queryFilters.verified = verified === "true";
		}

		// Add any other dynamic filters
		Object.keys(otherFilters).forEach((key) => {
			if (otherFilters[key]) {
				queryFilters[key] = otherFilters[key];
			}
		});

		console.log("Query filters:", queryFilters);

		// Fetch events with filters (since date fields are stored as strings)
		const events = await EventModel.find(queryFilters)
			.populate("organizerId", "full_name email profile_pic")
			.populate("category", "service_name");

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
		const paginatedEvents = upcomingEvents.slice(skip, skip + limitNum);

		// If no upcoming events are found
		if (!paginatedEvents.length) {
			return res.status(404).json({
				message: MESSAGE.get.custom("No upcoming events found"),
				result: [],
				totalPages: Math.ceil(totalEvents / limitNum),
				currentPage: pageNum
			});
		}

		return res.status(200).json({
			message: MESSAGE.get.succ,
			totalPages: Math.ceil(totalEvents / limitNum),
			currentPage: pageNum,
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

export const getFilteredEvents = async (req: Request, res: Response) => {
	try {
		const { search, page = "1", limit = "10", ...filters } = req.query;

		const pageNum = parseInt(page as string, 10);
		const limitNum = parseInt(limit as string, 10);
		const skip = (pageNum - 1) * limitNum;

		// Regex search for title
		if (search) {
			filters.title = { $regex: search, $options: "i" }; // Case-insensitive search
		}

		console.log("Filters received:", filters);
		console.log(`Pagination - Page: ${pageNum}, Limit: ${limitNum}`);

		const totalEvents = await EventModel.countDocuments(filters);
		const events = await EventModel.find(filters)
			.populate("organizerId", "full_name email")
			.populate("category", "service_name")
			.skip(skip)
			.limit(limitNum);

		if (!events.length) {
			return res.status(404).json({
				message: MESSAGE.get.custom("No events found matching the criteria"),
				result: [],
				totalPages: Math.ceil(totalEvents / limitNum),
				currentPage: pageNum
			});
		}

		return res.status(200).json({
			message: MESSAGE.get.succ,
			totalPages: Math.ceil(totalEvents / limitNum),
			currentPage: pageNum,
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
