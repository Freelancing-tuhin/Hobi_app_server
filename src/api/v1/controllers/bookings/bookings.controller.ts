import { Request, Response } from "express";
import BookingModel from "../../../../models/booking.model";
import EventModel from "../../../../models/event.model";
import { MESSAGE } from "../../../../constants/message";

export const createBooking = async (req: Request, res: Response) => {
	try {
		const { userId, eventId, ticketsCount, transactionId, amountPaid } = req.body;

		if (!eventId || !userId) {
			return res.status(400).json({
				message: MESSAGE.post.custom("Event ID and User ID are required")
			});
		}

		const event = await EventModel.findById(eventId);
		if (!event) {
			return res.status(404).json({
				message: MESSAGE.post.custom("Event not found")
			});
		}

		const payload = {
			userId,
			eventId,
			amountPaid,
			ticketsCount: ticketsCount || 1, // Default to 1 ticket if not provided
			transactionId: transactionId || null,
			paymentStatus: transactionId ? "Completed" : "Pending" // Auto mark as completed if transaction ID is present
		};

		const newBooking = await new BookingModel(payload).save();

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
