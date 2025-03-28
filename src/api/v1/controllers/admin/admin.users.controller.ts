import { Request, Response } from "express";
import UserModel from "../../../../models/user.model";

export const getUsersWithBookings = async (req: Request, res: Response) => {
	try {
		const { search, page = 1, limit = 10 } = req.query;
		const pageNumber = parseInt(page as string, 10) || 1;
		const limitNumber = parseInt(limit as string, 10) || 10;
		const skip = (pageNumber - 1) * limitNumber;

		const searchRegex = search ? new RegExp(search as string, "i") : null;

		const totalUsers = await UserModel.countDocuments(
			searchRegex
				? {
						$or: [{ full_name: { $regex: searchRegex } }, { email: { $regex: searchRegex } }]
				  }
				: {}
		);

		const usersWithBookings = await UserModel.aggregate([
			{
				$match: searchRegex
					? {
							$or: [{ full_name: { $regex: searchRegex } }, { email: { $regex: searchRegex } }]
					  }
					: {}
			},
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
			},
			{ $skip: skip },
			{ $limit: limitNumber }
		]);

		return res.status(200).json({
			message: "Users with bookings fetched successfully",
			result: usersWithBookings,
			pagination: {
				total: totalUsers,
				currentPage: pageNumber,
				totalPages: Math.ceil(totalUsers / limitNumber),
				limit: limitNumber
			}
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: "Failed to fetch users with bookings",
			error
		});
	}
};
