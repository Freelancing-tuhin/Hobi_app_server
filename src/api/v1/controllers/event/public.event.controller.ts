import { Request, Response } from "express";
import EventModel from "../../../../models/event.model";
import BookingModel from "../../../../models/booking.model";
import OrganizerModel from "../../../../models/organizer.model";
import mongoose from "mongoose";
import { calculatePlatformFee } from "../../../../services/platformFee";

/**
 * Calculate platform fee based on ticket price
 * Fee structure:
 * ₹0 – ₹500: Base ₹20 + 6%, No Cap
 * ₹600 – ₹1500: Base ₹30 + 7%, No Cap
 * ₹1600 – ₹3000: Base ₹40 + 6%, No Cap
 * ₹3000+: Base ₹60 + 4%, Max ₹300
 */


export const getEventByIdForUsers = async (req: Request, res: Response) => {
	try {
		const { eventId, userId } = req.query;

		// Fetch the event along with tickets
		const event = await EventModel.findById(eventId)
			.populate("organizerId", "full_name email phone profile_pic age gender") // Only fetch these fields
			.populate("category", "service_name")
			.lean();

		if (!event) {
			return res.status(404).json({ message: "Event not found" });
		}

		// Fetch bookings for this event
		const bookings: any = await BookingModel.find({ eventId }).lean();

		// Check if the user has already booked a ticket
		const userBooking = bookings.some((booking: { userId: string }) => booking.userId.toString() === userId);

		let routineCurrentMonthBooked = false;
		let routineNextMonth: string | null = null;
		if (event.type === "Routine" && userId && mongoose.Types.ObjectId.isValid(userId as string)) {
			const now = new Date();
			const currentMonth = now.getMonth();
			const currentYear = now.getFullYear();
			const nextMonthDate = new Date(currentYear, currentMonth + 1, 1);
			routineNextMonth = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, "0")}`;

			const userBookings = bookings.filter(
				(booking: any) => booking.userId.toString() === userId && booking.paymentStatus === "Completed"
			);
			routineCurrentMonthBooked = userBookings.some((booking: any) => {
				if (!booking.subscriptionStartDate) return false;
				const bookingDate = new Date(booking.subscriptionStartDate);
				return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
			});
		}

		// Calculate ticket availability
		const ticket_availability =
			event.tickets?.map(
				(ticket: { _id: { toString: () => string }; ticketName: any; ticketPrice: any; quantity: number; gst_amount: number }) => {
					const bookedTickets = bookings
						.filter(
							(booking: { ticketId: { toString: () => string }; transactionId?: string }) =>
								booking.ticketId.toString() === ticket._id.toString() && booking.transactionId
						)
						.reduce((acc: any, booking: { ticketsCount: any }) => acc + booking.ticketsCount, 0);

					return {
						_id: ticket._id,
						ticketName: ticket.ticketName,
						ticketPrice: ticket.ticketPrice,
						totalQuantity: ticket.quantity,
						gst_amount: ticket.gst_amount,
						available: ticket.quantity - bookedTickets, // Remaining tickets
						platformFee: calculatePlatformFee(ticket.ticketPrice) // Platform fee based on ticket price
					};
				}
			) || [];

		// Send final response
		res.json({
			message: "Data fetched successfully",
			result: {
				...event,
				booking_status: bookings.length > 0,
				ticket_availability,
				booked: userBooking,
				routineCurrentMonthBooked,
				routineRenewEligible: routineCurrentMonthBooked,
				routineNextMonth
			}
		});
	} catch (error) {
		console.error("Error fetching event:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

/**
 * Get organizer profile with selected details and all their events
 * @param organizerId - The ID of the organizer
 * @returns Organizer details and their events
 */
export const getOrganizerProfileWithEvents = async (req: Request, res: Response) => {
	try {
		const { organizerId } = req.query;

		// Validate organizerId
		if (!organizerId || !mongoose.Types.ObjectId.isValid(organizerId as string)) {
			return res.status(400).json({ message: "Invalid or missing organizer ID" });
		}

		// Fetch organizer with selected fields only
		const organizer = await OrganizerModel.findById(organizerId)
			.select("full_name profile_pic ratings is_verified address phone email service_category")
			.populate("service_category", "service_name")
			.lean();

		if (!organizer) {
			return res.status(404).json({ message: "Organizer not found" });
		}

		// Fetch all events by this organizer
		const events = await EventModel.find({ organizerId: new mongoose.Types.ObjectId(organizerId as string) })
			.populate("category", "service_name")
			.sort({ createdAt: -1 })
			.lean();

		return res.status(200).json({
			message: "Organizer profile fetched successfully",
			result: {
				organizer,
				events,
				totalEvents: events.length
			}
		});
	} catch (error) {
		console.error("Error fetching organizer profile:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
};
