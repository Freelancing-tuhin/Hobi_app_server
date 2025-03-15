import { Request, Response } from "express";
import EventModel from "../../../../models/event.model";
import BookingModel from "../../../../models/booking.model";
import { MESSAGE } from "../../../../constants/message";

export const dashBoardStats = async (req: Request, res: Response) => {
	try {
		const [totalEvents, totalIncome, totalBookings, pendingBookings, completedBookings, uniqueCustomers] =
			await Promise.all([
				EventModel.countDocuments(),
				BookingModel.aggregate([{ $group: { _id: null, total: { $sum: "$amountPaid" } } }]),
				BookingModel.countDocuments(),
				BookingModel.countDocuments({ paymentStatus: "Pending" }),
				BookingModel.countDocuments({ paymentStatus: "Completed" }),
				BookingModel.distinct("userId")
			]);

		return res.status(200).json({
			message: MESSAGE.get.succ,
			result: {
				totalEvents,
				totalIncome: totalIncome[0]?.total || 0,
				totalBookings,
				pendingBookings,
				completedBookings,
				totalUniqueCustomers: uniqueCustomers.length
			}
		});
	} catch (error) {
		console.error("Error verifying payment:", error);
		return res.status(500).json({ error: "Internal server error." });
	}
};
