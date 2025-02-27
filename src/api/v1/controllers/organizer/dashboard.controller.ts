import mongoose from "mongoose";
import { Request, Response } from "express";
import EventModel from "../../../../models/event.model";
import BookingModel from "../../../../models/booking.model";

export const getOrganizerStats = async (req: Request, res: Response) => {
	try {
		const { organizerId }: any = req.query;

		// Validate organizerId
		if (!mongoose.Types.ObjectId.isValid(organizerId)) {
			return res.status(400).json({ message: "Invalid organizer ID" });
		}

		// Find all events posted by this organizer
		const events = await EventModel.find({ organizerId }, { _id: 1 });

		if (events.length === 0) {
			return res.status(200).json({
				totalEvents: 0,
				totalBookings: 0,
				totalIncome: 0,
				pendingBookings: 0,
				confirmedBookings: 0
			});
		}

		// Extract event IDs
		const eventIds = events.map((event) => event._id);

		// Aggregate booking stats
		const bookings = await BookingModel.aggregate([
			{
				$match: {
					eventId: { $in: eventIds }
				}
			},
			{
				$group: {
					_id: "$paymentStatus",
					totalBookings: { $sum: 1 },
					totalIncome: {
						$sum: {
							$cond: [{ $eq: ["$paymentStatus", "confirmed"] }, "$amountPaid", 0]
						}
					}
				}
			}
		]);

		// Initialize stats
		const stats: any = {
			totalEvents: events.length,
			totalBookings: 0,
			totalIncome: 0,
			pendingBookings: 0,
			confirmedBookings: 0
		};

		// Process aggregated data
		bookings.forEach(({ _id, totalBookings, totalIncome }) => {
			stats.totalBookings += totalBookings;
			// if (_id === "pending") stats.pendingBookings = totalBookings;
			// if (_id === "confirmed") {
			stats.confirmedBookings = totalBookings;
			stats.totalIncome = totalIncome; // Only confirmed payments are counted
			// }
		});

		return res.status(200).json(stats);
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: "Failed to fetch organizer stats",
			error
		});
	}
};
