import { Request, Response } from "express";
import BookingModel from "../../../../models/booking.model";
import mongoose from "mongoose";
import moment from "moment";
import EventModel from "../../../../models/event.model";

export const getBookingStatistics = async (req: Request, res: Response) => {
	try {
		const { eventId }: any = req.query;
		if (!mongoose.Types.ObjectId.isValid(eventId)) {
			return res.status(400).json({ message: "Invalid event ID" });
		}

		const today = moment().startOf("day").toDate();
		const weekStart = moment().startOf("week").toDate();
		const weekEnd = moment().endOf("week").toDate();

		const aggregationPipeline = [
			{
				$match: { eventId: new mongoose.Types.ObjectId(eventId) }
			},
			{
				$facet: {
					totalBookings: [{ $count: "count" }],
					bookingsThisWeek: [
						{
							$match: {
								createdAt: { $gte: weekStart, $lte: weekEnd }
							}
						},
						{ $count: "count" }
					],
					bookingsToday: [
						{
							$match: {
								createdAt: { $gte: today }
							}
						},
						{ $count: "count" }
					],
					totalIncome: [
						{
							$group: {
								_id: null,
								total: { $sum: "$amountPaid" }
							}
						}
					],
					todaysIncome: [
						{
							$match: {
								createdAt: { $gte: today }
							}
						},
						{
							$group: {
								_id: null,
								total: { $sum: "$amountPaid" }
							}
						}
					]
				}
			}
		];

		const result = await BookingModel.aggregate(aggregationPipeline);
		const eventDetails = await EventModel.findById(eventId);

		return res.status(200).json({
			totalBookings: result[0].totalBookings[0]?.count || 0,
			bookingsThisWeek: result[0].bookingsThisWeek[0]?.count || 0,
			bookingsToday: result[0].bookingsToday[0]?.count || 0,
			totalIncome: result[0].totalIncome[0]?.total || 0,
			todaysIncome: result[0].todaysIncome[0]?.total || 0,
			eventDetails: eventDetails || {}
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			message: "Failed to fetch booking statistics",
			error
		});
	}
};

export const getBookingsByEvent = async (req: Request, res: Response) => {
	try {
		const { eventId }: any = req.query;
		if (!mongoose.Types.ObjectId.isValid(eventId)) {
			return res.status(400).json({ message: "Invalid event ID" });
		}

		const bookings = await BookingModel.aggregate([
			{
				$match: { eventId: new mongoose.Types.ObjectId(eventId) }
			},
			{
				$lookup: {
					from: "users",
					localField: "userId",
					foreignField: "_id",
					as: "userDetails"
				}
			},
			{
				$unwind: "$userDetails"
			},
			{
				$project: {
					_id: 1,
					userId: "$userId",
					eventId: "$eventId",
					amountPaid: "$amountPaid",
					bookingDate: "$createdAt",
					bookingStatus: "$booking_status",
					ticketName: "$ticketName",
					bookingId: "$_id",
					userDetails: "$userDetails"
				}
			}
		]);

		return res.status(200).json({ result: bookings });
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			message: "Failed to fetch bookings for the event",
			error
		});
	}
};

export const getBookingPerformance = async (req: Request, res: Response) => {
	try {
		const { eventId }: any = req.query;

		// Validate eventId
		if (!mongoose.Types.ObjectId.isValid(eventId)) {
			return res.status(400).json({ message: "Invalid event ID" });
		}

		// Get the first day of the current month
		const now = new Date();
		const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

		// Aggregate bookings
		const bookings = await BookingModel.aggregate([
			{
				$match: {
					eventId: new mongoose.Types.ObjectId(eventId)
				}
			},
			{
				$group: {
					_id: "$paymentStatus",
					count: { $sum: 1 },
					newBookings: {
						$sum: {
							$cond: [{ $gte: ["$createdAt", firstDayOfMonth] }, 1, 0]
						}
					}
				}
			}
		]);

		// Initialize stats
		const stats: any = {
			newBookings: 0,
			pending: 0,
			confirmed: 0,
			total: 0
		};

		// Map aggregation result
		bookings.forEach(({ _id, count, newBookings }) => {
			if (_id === "pending") stats.pending = count;
			if (_id === "confirmed") stats.confirmed = count;
			stats.total += count;
			stats.newBookings += newBookings; // Summing up new bookings count
		});

		return res.status(200).json(stats);
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: "Failed to fetch booking performance",
			error
		});
	}
};
