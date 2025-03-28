import { Request, Response } from "express";
import UserModel from "../../../../models/user.model";

export const getUsersWithBookings = async (req: Request, res: Response) => {
	try {
		const usersWithBookings = await UserModel.aggregate([
			{
				$lookup: {
					from: "bookings", // Collection name in MongoDB
					localField: "_id",
					foreignField: "userId",
					as: "bookings"
				}
			},
			{
				$unwind: {
					path: "$bookings",
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$lookup: {
					from: "events", // Collection name in MongoDB
					localField: "bookings.eventId",
					foreignField: "_id",
					as: "bookings.eventDetails"
				}
			},
			{
				$group: {
					_id: "$_id",
					full_name: { $first: "$full_name" },
					email: { $first: "$email" },
					address: { $first: "$address" },
					bookings: { $push: "$bookings" }
				}
			}
		]);

		return res.status(200).json({
			message: "Users with bookings fetched successfully",
			result: usersWithBookings
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: "Failed to fetch users with bookings",
			error
		});
	}
};
