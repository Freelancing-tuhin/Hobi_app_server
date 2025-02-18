import { Request, Response } from "express";
import BookingModel from "../../../../models/booking.model";
import EventModel from "../../../../models/event.model";
import { MESSAGE } from "../../../../constants/message";

export const createBooking = async (req: Request, res: Response) => {
	try {
		const { userId, eventId, ticketsCount } = req.body;

		// Check if eventId and userId are provided
		if (!eventId || !userId) {
			return res.status(400).json({
				message: MESSAGE.post.custom("Event ID and User ID are required")
			});
		}

		// Check if the event exists
		const event = await EventModel.findById(eventId);
		if (!event) {
			return res.status(404).json({
				message: MESSAGE.post.custom("Event not found")
			});
		}

		// Check if the user has already booked this event
		const existingBooking = await BookingModel.findOne({ userId, eventId });
		if (existingBooking) {
			return res.status(400).json({
				message: MESSAGE.post.custom("You have already booked this event")
			});
		}

		// Prepare the booking payload
		const payload = {
			userId,
			eventId,
			amountPaid: 0,
			ticketsCount: ticketsCount || 1, // Default to 1 ticket if not provided
			transactionId: null,
			paymentStatus: "Pending" // Auto mark as pending as no transaction is yet
		};

		// Create and save the new booking
		const newBooking = await new BookingModel(payload).save();

		// Return success response with the newly created booking
		return res.status(200).json({
			message: MESSAGE.post.succ,
			result: newBooking
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			message: MESSAGE.post.fail,
			error
		});
	}
};

export const updateBooking = async (req: Request, res: Response) => {
	try {
		const { bookingId, transactionId, paymentStatus, amountPaid } = req.body;

		// Find the booking by ID
		const booking = await BookingModel.findById(bookingId);
		if (!booking) {
			return res.status(404).json({
				message: MESSAGE.put.custom("Booking not found")
			});
		}

		// Update the transaction ID and payment status
		booking.amountPaid = amountPaid;
		booking.transactionId = transactionId;
		booking.paymentStatus = paymentStatus;

		// Save the updated booking
		const updatedBooking = await booking.save();

		// Return success response
		return res.status(200).json({
			message: MESSAGE.put.succ,
			result: updatedBooking
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			message: MESSAGE.put.fail,
			error
		});
	}
};

/**
 * Get all bookings for a specific user
 */
export const getUserBookings = async (req: Request, res: Response) => {
	try {
		const { userId } = req.query;

		if (!userId) {
			return res.status(400).json({ message: "User ID is required" });
		}

		const bookings = await BookingModel.find({ userId });

		return res.status(200).json({
			message: MESSAGE.get.succ,
			result: bookings
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			message: MESSAGE.get.fail,
			error
		});
	}
};

/**
 * Get all bookings for a specific event
 */
export const getEventBookings = async (req: Request, res: Response) => {
	try {
		const { eventId } = req.query;

		if (!eventId) {
			return res.status(400).json({ message: "Event ID is required" });
		}

		const bookings = await BookingModel.find({ eventId });

		return res.status(200).json({
			message: MESSAGE.get.succ,
			result: bookings
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			message: MESSAGE.get.fail,
			error
		});
	}
};

/**
 * Cancel a booking
 */
export const cancelBooking = async (req: Request, res: Response) => {
	try {
		const { bookingId } = req.body;

		if (!bookingId) {
			return res.status(400).json({ message: "Booking ID is required" });
		}

		const booking = await BookingModel.findByIdAndUpdate(bookingId, { paymentStatus: "Failed" }, { new: true });

		if (!booking) {
			return res.status(404).json({ message: "Booking not found" });
		}

		return res.status(200).json({
			message: MESSAGE.patch.succ,
			result: booking
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			message: MESSAGE.patch.fail,
			error
		});
	}
};
