import { Request, Response } from "express";
import mongoose from "mongoose";
import BookingModel from "../../../../models/booking.model";
import EventModel from "../../../../models/event.model";
import { MESSAGE } from "../../../../constants/message";
import Razorpay from "razorpay";

export const createBooking = async (req: Request, res: Response) => {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const { userId, eventId, ticketId, ticketsCount, receipt } = req.body;

		if (!eventId || !userId || !ticketId) {
			return res.status(400).json({
				message: MESSAGE.post.custom("Event ID, User ID, and Ticket ID are required")
			});
		}

		const event = await EventModel.findById(eventId).session(session);
		if (!event) {
			await session.abortTransaction();
			return res.status(404).json({
				message: MESSAGE.post.custom("Event not found")
			});
		}

		const ticket = event.tickets.find((t: { _id: { toString: () => any } }) => t._id.toString() === ticketId);
		if (!ticket) {
			await session.abortTransaction();
			return res.status(400).json({
				message: MESSAGE.post.custom("Invalid Ticket ID")
			});
		}

		// Check total tickets booked for this ticket ID
		const totalBookedTickets = await BookingModel.aggregate([
			{
				$match: {
					eventId: new mongoose.Types.ObjectId(eventId),
					ticketId: new mongoose.Types.ObjectId(ticketId)
				}
			},
			{
				$group: {
					_id: null,
					totalBooked: { $sum: "$ticketsCount" }
				}
			}
		]).session(session);

		const bookedCount = totalBookedTickets.length > 0 ? totalBookedTickets[0].totalBooked : 0;

		// Check if enough tickets are available
		if (bookedCount + ticketsCount > ticket.quantity) {
			await session.abortTransaction();
			return res.status(400).json({
				message: MESSAGE.post.custom("Ticket sold out or not enough tickets available")
			});
		}

		// Process payment
		const amount = ticket.ticketPrice * ticketsCount;
		const instance = new Razorpay({ key_id: "rzp_test_WOvg0OAJCnGejI", key_secret: "ZpwuC7sSd9rer6BJLvY3HId9" });
		const response = await instance.orders.create({
			amount: amount * 100,
			currency: "INR",
			receipt: receipt
		});

		// Create booking
		const newBooking = await new BookingModel({
			userId,
			eventId,
			ticketId,
			amountPaid: 0,
			ticketsCount,
			transactionId: null,
			paymentStatus: "Pending"
		}).save({ session });

		await session.commitTransaction();
		session.endSession();

		return res.status(200).json({
			message: MESSAGE.post.succ,
			result: newBooking,
			payment: response
		});
	} catch (error) {
		await session.abortTransaction();
		session.endSession();
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

		const booking = await BookingModel.findById(bookingId);
		if (!booking) {
			return res.status(404).json({
				message: MESSAGE.put.custom("Booking not found")
			});
		}

		booking.amountPaid = amountPaid;
		booking.transactionId = transactionId;
		booking.paymentStatus = paymentStatus;

		const updatedBooking = await booking.save();

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

export const updateBookingStatus = async (req: Request, res: Response) => {
	try {
		const { bookingId, booking_status } = req.body;

		// Validate booking_status
		const validStatuses = ["Pending", "check-in", "in-progress", "Completed", "Canceled"];
		if (!validStatuses.includes(booking_status)) {
			return res.status(400).json({
				message: "Invalid booking status"
			});
		}

		const booking = await BookingModel.findById(bookingId);
		if (!booking) {
			return res.status(404).json({
				message: MESSAGE.put.custom("Booking not found")
			});
		}

		booking.booking_status = booking_status;
		const updatedBooking = await booking.save();

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
