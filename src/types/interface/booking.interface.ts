import { Types } from "mongoose";

export interface IBooking {
	userId: Types.ObjectId;
	eventId: Types.ObjectId;
	ticketId: Types.ObjectId;
	amountPaid: number;
	paymentStatus?: "Pending" | "Completed" | "Failed"; // Optional with default value
	ticketsCount?: number; // Optional, in case of multiple ticket bookings
	transactionId?: string | null; // For online payments, can be null if not applicable
	booking_status?: "Pending" | "check-in" | "in-progress" | "Completed" | "Canceled"; // Optional with default value
}
