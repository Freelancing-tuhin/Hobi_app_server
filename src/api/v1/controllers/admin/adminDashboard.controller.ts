import { Request, Response } from "express";
import EventModel from "../../../../models/event.model";
import BookingModel from "../../../../models/booking.model";
import { MESSAGE } from "../../../../constants/message";
import moment from "moment";

export const dashBoardStats = async (req: Request, res: Response) => {
	try {
		const startOfThisMonth = moment().startOf("month").toDate();
		const startOfLastMonth = moment().subtract(1, "month").startOf("month").toDate();
		const endOfLastMonth = moment().subtract(1, "month").endOf("month").toDate();

		const monthlyEvents = await EventModel.aggregate([
			{
				$group: {
					_id: { $month: "$createdAt" },
					total: { $sum: 1 }
				}
			},
			{
				$sort: { _id: 1 }
			}
		]);

		const eventsByMonth = monthlyEvents.map((event) => event.total).filter((total) => total > 0);

		const [
			totalEvents,
			totalIncome,
			totalBookings,
			pendingBookings,
			completedBookings,
			totalUniqueCustomers,
			thisMonthUniqueCustomers,
			lastMonthUniqueCustomers
		] = await Promise.all([
			EventModel.countDocuments(),
			BookingModel.aggregate([{ $group: { _id: null, total: { $sum: "$amountPaid" } } }]),
			BookingModel.countDocuments(),
			BookingModel.countDocuments({ paymentStatus: "Pending" }),
			BookingModel.countDocuments({ paymentStatus: "Completed" }),
			BookingModel.distinct("userId"),
			BookingModel.distinct("userId", { createdAt: { $gte: startOfThisMonth } }),
			BookingModel.distinct("userId", { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } })
		]);

		return res.status(200).json({
			message: MESSAGE.get.succ,
			result: {
				totalEvents,
				totalIncome: totalIncome[0]?.total || 0,
				totalBookings,
				pendingBookings,
				completedBookings,
				totalUniqueCustomers: totalUniqueCustomers.length,
				thisMonthUniqueCustomers: thisMonthUniqueCustomers.length,
				lastMonthUniqueCustomers: lastMonthUniqueCustomers.length,
				eventsByMonth
			}
		});
	} catch (error) {
		console.error("Error verifying payment:", error);
		return res.status(500).json({ error: "Internal server error." });
	}
};
