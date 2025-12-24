import { Request, Response } from "express";
import UserModel from "../../../../models/user.model";
import BookingModel from "../../../../models/booking.model";
import { MESSAGE } from "../../../../constants/message";
import mongoose from "mongoose";

/**
 * Get user details by ID (from JWT token)
 * Returns user profile information excluding password
 */
export const getUserDetails = async (req: any, res: Response) => {
	try {
		// Get userId from JWT token (attached by jwtAuthMiddleware)
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({
				message: "Unauthorized: Invalid token"
			});
		}

		// Find user by ID, excluding password
		const user = await UserModel.findById(userId).select("-password");

		if (!user) {
			return res.status(404).json({
				message: MESSAGE.get.custom("User not found")
			});
		}

		return res.status(200).json({
			message: MESSAGE.get.succ,
			result: user
		});
	} catch (error) {
		console.error("Error fetching user details:", error);
		return res.status(500).json({
			message: MESSAGE.get.fail,
			error
		});
	}
};

/**
 * Get user details with all bookings
 * Returns user profile along with their booking history
 */
export const getUserWithBookings = async (req: any, res: Response) => {
	try {
		// Get userId from JWT token or query params
		const userId =  req.query.userId;

		if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
			return res.status(400).json({
				message: MESSAGE.get.custom("Invalid or missing User ID")
			});
		}

		// Pagination parameters
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 10;
		const skip = (page - 1) * limit;

		// Find user by ID, excluding password
		const user = await UserModel.findById(userId).select("-password");

		if (!user) {
			return res.status(404).json({
				message: MESSAGE.get.custom("User not found")
			});
		}

		// Get total bookings count for pagination
		const totalBookings = await BookingModel.countDocuments({ userId });

		// Get user's bookings with event details populated
		const bookings = await BookingModel.find({ userId })
			.populate({
				path: "eventId",
				select: "title description startDate startTime endTime location banner_Image category type"
			})
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);

		return res.status(200).json({
			message: MESSAGE.get.succ,
			result: {
				user,
				bookings
			},
			totalBookings,
			totalPages: Math.ceil(totalBookings / limit),
			currentPage: page
		});
	} catch (error) {
		console.error("Error fetching user with bookings:", error);
		return res.status(500).json({
			message: MESSAGE.get.fail,
			error
		});
	}
};

/**
 * Get user bookings only
 * Returns paginated bookings for a user
 */
export const getUserBookings = async (req: any, res: Response) => {
	try {
		// Get userId from JWT token or query params
		const userId = req.user?.id || req.query.userId;

		if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
			return res.status(400).json({
				message: MESSAGE.get.custom("Invalid or missing User ID")
			});
		}

		// Pagination and filter parameters
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 10;
		const skip = (page - 1) * limit;
		const status = req.query.status as string; // Optional filter by booking status

		// Build query
		const query: any = { userId };
		if (status) {
			query.booking_status = status;
		}

		// Get total bookings count
		const totalBookings = await BookingModel.countDocuments(query);

		// Get bookings with event details
		const bookings = await BookingModel.find(query)
			.populate({
				path: "eventId",
				select: "title description startDate startTime endTime location banner_Image category type organizerId",
				populate: {
					path: "organizerId",
					select: "full_name email phone profile_pic"
				}
			})
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);

		return res.status(200).json({
			message: MESSAGE.get.succ,
			result: bookings,
			totalBookings,
			totalPages: Math.ceil(totalBookings / limit),
			currentPage: page
		});
	} catch (error) {
		console.error("Error fetching user bookings:", error);
		return res.status(500).json({
			message: MESSAGE.get.fail,
			error
		});
	}
};

/**
 * Update user profile details
 * Updates user information (excluding password)
 */
export const updateUserDetails = async (req: any, res: Response) => {
	try {
		// Get userId from JWT token or query params
		const userId = req.user?.id || req.query.userId;
		const userData = req.body;

		if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
			return res.status(400).json({
				message: MESSAGE.patch.custom("Invalid or missing User ID")
			});
		}

		// Remove sensitive fields that shouldn't be updated via this endpoint
		delete userData.password;
		delete userData._id;

		// Update user details
		const updatedUser = await UserModel.findByIdAndUpdate(
			userId,
			{ $set: userData },
			{ new: true, runValidators: true }
		).select("-password");

		if (!updatedUser) {
			return res.status(404).json({
				message: MESSAGE.patch.custom("User not found")
			});
		}

		return res.status(200).json({
			message: MESSAGE.patch.succ,
			result: updatedUser
		});
	} catch (error) {
		console.error("Error updating user details:", error);
		return res.status(500).json({
			message: MESSAGE.patch.fail,
			error
		});
	}
};

/**
 * Update user password
 * Updates user password with validation
 */
export const updateUserPassword = async (req: any, res: Response) => {
	try {
		// Get userId from JWT token
		const userId = req.user?.id;
		const { currentPassword, newPassword } = req.body;

		if (!userId) {
			return res.status(401).json({
				message: "Unauthorized: Invalid token"
			});
		}

		if (!currentPassword || !newPassword) {
			return res.status(400).json({
				message: MESSAGE.patch.custom("Current password and new password are required")
			});
		}

		// Find user and verify current password
		const user = await UserModel.findById(userId);

		if (!user) {
			return res.status(404).json({
				message: MESSAGE.patch.custom("User not found")
			});
		}

		// Verify current password (you may want to use bcrypt.compare here)
		if (user.password !== currentPassword) {
			return res.status(400).json({
				message: MESSAGE.patch.custom("Current password is incorrect")
			});
		}

		// Update password
		user.password = newPassword;
		await user.save();

		return res.status(200).json({
			message: MESSAGE.patch.custom("Password updated successfully")
		});
	} catch (error) {
		console.error("Error updating user password:", error);
		return res.status(500).json({
			message: MESSAGE.patch.fail,
			error
		});
	}
};

/**
 * Delete user account
 * Soft delete or permanently delete user account
 */
export const deleteUserAccount = async (req: any, res: Response) => {
	try {
		// Get userId from JWT token
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({
				message: "Unauthorized: Invalid token"
			});
		}

		// Delete user
		const deletedUser = await UserModel.findByIdAndDelete(userId);

		if (!deletedUser) {
			return res.status(404).json({
				message: MESSAGE.delete.custom("User not found")
			});
		}

		return res.status(200).json({
			message: MESSAGE.delete.succ
		});
	} catch (error) {
		console.error("Error deleting user account:", error);
		return res.status(500).json({
			message: MESSAGE.delete.fail,
			error
		});
	}
};
