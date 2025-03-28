import { Request, Response } from "express";
import EventModel from "../../../../models/event.model";
import BookingModel from "../../../../models/booking.model";
import UserModel from "../../../../models/user.model";
import { MESSAGE } from "../../../../constants/message";
import moment from "moment";

export const dashBoardStats = async (req: Request, res: Response) => {
	try {
		const startOfThisMonth = moment().startOf("month").toDate();
		const startOfLastMonth = moment().subtract(1, "month").startOf("month").toDate();
		const endOfLastMonth = moment().subtract(1, "month").endOf("month").toDate();

		const monthlyEvents = await EventModel.aggregate([
			{ $group: { _id: { $month: "$createdAt" }, total: { $sum: 1 } } },
			{ $sort: { _id: 1 } }
		]);

		const eventsByMonth = Array(12).fill(0);
		monthlyEvents.forEach((event) => {
			eventsByMonth[event._id - 1] = event.total;
		});

		const monthlyIncome = await BookingModel.aggregate([
			{ $group: { _id: { $month: "$createdAt" }, totalIncome: { $sum: "$amountPaid" } } },
			{ $sort: { _id: 1 } }
		]);

		const incomeByMonth = Array(12).fill(0);
		monthlyIncome.forEach((income) => {
			incomeByMonth[income._id - 1] = income.totalIncome === 1 ? 10 : income.totalIncome;
		});

		const monthlyUsers = await UserModel.aggregate([
			{ $group: { _id: { $month: "$createdAt" }, totalUsers: { $sum: 1 } } },
			{ $sort: { _id: 1 } }
		]);

		const userByMonth = Array(12).fill(0);
		monthlyUsers.forEach((user) => {
			userByMonth[user._id - 1] = user.totalUsers;
		});

		const monthlyBookings = await BookingModel.aggregate([
			{ $group: { _id: { $month: "$createdAt" }, totalBookings: { $sum: 1 } } },
			{ $sort: { _id: 1 } }
		]);

		const bookingByMonth = Array(12).fill(0);
		monthlyBookings.forEach((booking) => {
			bookingByMonth[booking._id - 1] = booking.totalBookings;
		});

		const [
			totalEvents,
			totalIncome,
			totalBookings,
			pendingBookings,
			completedBookings,
			totalUniqueCustomers,
			thisMonthUniqueCustomers,
			lastMonthUniqueCustomers,
			repeatCustomers
		] = await Promise.all([
			EventModel.countDocuments(),
			BookingModel.aggregate([{ $group: { _id: null, total: { $sum: "$amountPaid" } } }]),
			BookingModel.countDocuments(),
			BookingModel.countDocuments({ paymentStatus: "Pending" }),
			BookingModel.countDocuments({ paymentStatus: "Completed" }),
			BookingModel.distinct("userId"),
			BookingModel.distinct("userId", { createdAt: { $gte: startOfThisMonth } }),
			BookingModel.distinct("userId", { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
			BookingModel.aggregate([
				{ $group: { _id: "$userId", count: { $sum: 1 } } },
				{ $match: { count: { $gt: 1 } } },
				{ $count: "repeatCustomers" }
			])
		]);

		const repeatCustomerCount = repeatCustomers[0]?.repeatCustomers || 0;
		const repeatCustomerPercentage =
			totalUniqueCustomers.length > 0 ? (repeatCustomerCount / totalUniqueCustomers.length) * 100 : 0;

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
				repeatCustomerPercentage,
				eventsByMonth,
				incomeByMonth,
				userByMonth,
				bookingByMonth
			}
		});
	} catch (error) {
		console.error("Error verifying payment:", error);
		return res.status(500).json({ error: "Internal server error." });
	}
};
