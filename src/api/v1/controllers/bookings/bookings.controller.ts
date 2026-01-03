import { Request, Response } from "express";
import mongoose from "mongoose";
import BookingModel from "../../../../models/booking.model";
import EventModel from "../../../../models/event.model";
import { MESSAGE } from "../../../../constants/message";
import Razorpay from "razorpay";
import { calculatePlatformFee } from "../../../../services/platformFee";
import { createTransaction } from "../../../../services/transaction.service";

const razorpayInstance = new Razorpay({
	key_id: "rzp_test_RxwbroJYSpkRhI",
	key_secret: "gNK42T2F9zVuRSXqGIyZIUUc"
});

export const createBooking = async (req: Request, res: Response) => {
	try {
		const { userId, eventId, ticketId, ticketsCount, receipt } = req.body;

		if (!eventId || !userId || !ticketId) {
			return res.status(400).json({
				message: MESSAGE.post.custom("Event ID, User ID, and Ticket ID are required")
			});
		}

		const event = await EventModel.findById(eventId);
		if (!event) {
			return res.status(404).json({
				message: MESSAGE.post.custom("Event not found")
			});
		}

		const ticket = event.tickets.find((t: { _id: { toString: () => any } }) => t._id.toString() === ticketId);
		if (!ticket) {
			return res.status(400).json({
				message: MESSAGE.post.custom("Invalid Ticket ID")
			});
		}

		// Check total tickets booked for this ticket ID (only confirmed bookings with transactionId)
		const totalBookedTickets = await BookingModel.aggregate([
			{
				$match: {
					eventId: new mongoose.Types.ObjectId(eventId),
					ticketId: new mongoose.Types.ObjectId(ticketId),
					transactionId: { $ne: null }
				}
			},
			{
				$group: {
					_id: null,
					totalBooked: { $sum: "$ticketsCount" }
				}
			}
		]);

		const bookedCount = totalBookedTickets.length > 0 ? totalBookedTickets[0].totalBooked : 0;

		// Check if enough tickets are available
		if (bookedCount + ticketsCount > ticket.quantity) {
			return res.status(400).json({
				message: MESSAGE.post.custom("Ticket sold out or not enough tickets available")
			});
		}

		// Process payment
		const amount = ticket.ticketPrice * ticketsCount;
		const response = await razorpayInstance.orders.create({
			amount: (amount + calculatePlatformFee(ticket.ticketPrice)) * 100,
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
			paymentStatus: "Pending",
			orderId: response.id
		}).save();

		return res.status(200).json({
			message: MESSAGE.post.succ,
			result: newBooking,
			payment: response
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
		const { bookingId, transactionId ,platformfee} = req.body;

		// Find booking
		const booking: any = await BookingModel.findById(bookingId);
		if (!booking) {
			return res.status(404).json({
				message: MESSAGE.put.custom("Booking not found")
			});
		}

		// Verify Payment from Razorpay
		const payment: any = await razorpayInstance.payments.fetch(transactionId);
		if (!payment) {
			return res.status(400).json({
				message: MESSAGE.put.custom("Invalid transaction ID or payment not found")
			});
		}

		// Check if the payment was successful
		if (payment.status !== "captured") {
			return res.status(400).json({
				message: MESSAGE.put.custom("Payment verification failed. Payment not captured."),
				paymentStatus: payment.status
			});
		}
	const transaction:any = await createTransaction({
			type: "booking",
			amount: (payment.amount / 100) - platformfee,
			senderId: booking.userId,
			receiverId: booking.eventId,
			reference: booking.receipt,
			platformFee: platformfee,
			orderId: booking.orderId,
			razorPay_payment_id : transactionId
		});
		// Update booking details
		booking.amountPaid = (payment.amount / 100) - platformfee; // Razorpay returns amount in paise
		booking.transactionId = transaction?._id;
		booking.paymentStatus = "Completed";
		booking.booking_status = "Pending"; // Assuming you want to update this

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

export const refundBooking = async (req: Request, res: Response) => {
	try {
		const { bookingId } = req.body;

		// Find the booking
		const booking: any = await BookingModel.findById(bookingId);
		if (!booking) {
			return res.status(404).json({
				message: MESSAGE.put.custom("Booking not found")
			});
		}

		if (booking.paymentStatus === "Refunded" || !booking.transactionId) {
			return res.status(400).json({
				message: MESSAGE.put.custom("Refund already completed.")
			});
		}
		if (booking.paymentStatus !== "Completed" || !booking.transactionId) {
			return res.status(400).json({
				message: MESSAGE.put.custom("Refund not possible. Payment is not completed.")
			});
		}

		// Process refund via Razorpay
		const refundResponse = await razorpayInstance.payments.refund(booking.transactionId, {
			amount: booking.amountPaid * 100, // Convert to paisa (if needed)
			speed: "normal" // Use "instant" for an instant refund
		});

		// Update booking status
		booking.paymentStatus = "Refunded";
		booking.booking_status = "Cancelled";
		booking.refundId = refundResponse?.id;

		const updatedBooking = await booking.save();

		return res.status(200).json({
			message: MESSAGE.put.succ,
			result: updatedBooking,
			refund: refundResponse
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

export const getOrganizerBookings = async (req: Request, res: Response) => {
	try {
		const { organizerId, page = 1, limit = 10 } = req.query;
		const pageNumber = parseInt(page as string) || 1;
		const limitNumber = parseInt(limit as string) || 10;
		const skip = (pageNumber - 1) * limitNumber;

		if (!organizerId) {
			return res.status(400).json({ message: "Organizer ID is required" });
		}

		// Find events created by the organizer
		const events = await EventModel.find({ organizerId }).select("_id");
		const eventIds = events.map((event) => event._id);

		if (eventIds.length === 0) {
			return res.status(200).json({ message: "No bookings found", result: [] });
		}

		// Find bookings for those events with pagination
		const bookings = await BookingModel.find({ eventId: { $in: eventIds } })
			.populate("eventId")
			.populate("userId")
			.skip(skip)
			.limit(limitNumber);

		const totalBookings = await BookingModel.countDocuments({ eventId: { $in: eventIds } });
		const totalPages = Math.ceil(totalBookings / limitNumber);

		return res.status(200).json({
			message: MESSAGE.get.succ,
			result: bookings,
			pagination: {
				totalBookings,
				totalPages,
				currentPage: pageNumber,
				limit: limitNumber
			}
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
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
