import { Request, Response } from "express";
import EventModel from "../../../../models/event.model"; // Import the Event model
import BookingModel from "../../../../models/booking.model"; // Import the Booking model
import mongoose from "mongoose";
import { MESSAGE } from "../../../../constants/message";

export const eventStats = async (req: Request, res: Response) => {
	try {
		const { eventId }: any = req.query;

		// Check if the provided eventId is a valid MongoDB ObjectId
		if (!mongoose.Types.ObjectId.isValid(eventId)) {
			return res.status(400).json({
				message: MESSAGE.get.custom("Invalid Event ID")
			});
		}

		// Use aggregation to get event details, total bookings, total paid amount, and the bookings list
		const eventStats = await EventModel.aggregate([
			{
				$match: { _id: new mongoose.Types.ObjectId(eventId) }
			},
			{
				$lookup: {
					from: "bookings", // The bookings collection
					localField: "_id", // The field in EventModel to match
					foreignField: "eventId", // The field in BookingModel to match
					as: "bookings" // The resulting bookings will be stored in this array field
				}
			},
			{
				$addFields: {
					totalBookings: { $size: "$bookings" }, // Count the number of bookings
					totalPaidAmount: {
						$sum: "$bookings.amountPaid" // Sum the amountPaid field of all bookings
					}
				}
			},
			{
				$project: {
					"bookings.userId": 0, // Optionally hide the userId field from the bookings list
					"bookings.transactionId": 0, // Optionally hide the transactionId from the bookings
					"bookings.paymentStatus": 0 // Optionally hide the paymentStatus field from the bookings
				}
			}
		]);

		// If no event is found, return a 404
		if (eventStats.length === 0) {
			return res.status(404).json({
				message: MESSAGE.get.custom("Event not found")
			});
		}

		// Return the event details along with the stats
		return res.status(200).json({
			message: MESSAGE.get.succ,
			result: eventStats[0] // Return the first (and only) event object from the aggregation result
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			message: MESSAGE.get.fail,
			error: error
		});
	}
};
