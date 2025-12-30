import { Request, Response } from "express";
import EventModel from "../../../../models/event.model";
import BookingModel from "../../../../models/booking.model";

export const getEventByIdForUsers = async (req: Request, res: Response) => {
	try {
		const { eventId, userId } = req.query;

		// Fetch the event along with tickets
		const event = await EventModel.findById(eventId)
			.populate("organizerId", "full_name email phone profile_pic") // Only fetch these fields
			.populate("category", "service_name")
			.lean();

		if (!event) {
			return res.status(404).json({ message: "Event not found" });
		}

		// Fetch bookings for this event
		const bookings: any = await BookingModel.find({ eventId }).lean();

		// Check if the user has already booked a ticket
		const userBooking = bookings.some((booking: { userId: string }) => booking.userId.toString() === userId);

		// Calculate ticket availability
		const ticket_availability =
			event.tickets?.map(
				(ticket: { _id: { toString: () => string }; ticketName: any; ticketPrice: any; quantity: number }) => {
					const bookedTickets = bookings
						.filter(
							(booking: { ticketId: { toString: () => string } }) =>
								booking.ticketId.toString() === ticket._id.toString()
						)
						.reduce((acc: any, booking: { ticketsCount: any }) => acc + booking.ticketsCount, 0);

					return {
						ticketName: ticket.ticketName,
						ticketPrice: ticket.ticketPrice,
						totalQuantity: ticket.quantity,
						available: ticket.quantity - bookedTickets // Remaining tickets
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
				booked: userBooking // Flag to indicate if the user has booked any ticket
			}
		});
	} catch (error) {
		console.error("Error fetching event:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};
