import { Request, Response } from "express";
import ReviewModel from "../../../../models/review.model";
import { MESSAGE } from "../../../../constants/message";
import EventModel from "../../../../models/event.model"; // Updated to reference events instead of providers

// Create Event Review
export const createReview = async (req: Request, res: Response) => {
	try {
		const { comment, rating, userId, eventId } = req.body;

		// Validate required fields
		if (!comment || !rating || !userId || !eventId) {
			return res.status(400).json({ message: "Missing required fields." });
		}

		// Save the new review
		const newReview = await new ReviewModel({
			comment,
			rating,
			userId,
			eventId
		}).save();

		// Fetch all reviews for the given event to recalculate the average rating
		const reviews = await ReviewModel.find({ eventId });

		if (reviews.length > 0) {
			const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
			const averageRating = totalRatings / reviews.length;

			// Update event's average rating
			await EventModel.findByIdAndUpdate(eventId, { ratings: averageRating });
		}

		return res.status(200).json({
			message: MESSAGE.post.succ,
			result: newReview
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: MESSAGE.post.fail,
			error
		});
	}
};

// Edit Review
export const editReview = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const updateData = req.body;

		const updatedReview = await ReviewModel.findByIdAndUpdate(id, updateData, {
			new: true
		});

		if (!updatedReview) {
			return res.status(404).json({
				message: MESSAGE.patch.fail
			});
		}

		return res.status(200).json({
			message: MESSAGE.patch.succ,
			result: updatedReview
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			message: MESSAGE.patch.fail,
			error
		});
	}
};

export const updateReviewStatusToAdmin = async (req: Request, res: Response) => {
	try {
		const { id } = req.query;

		const updatedReview = await ReviewModel.findByIdAndUpdate(id, { review_status: "Admin" }, { new: true });

		if (!updatedReview) {
			return res.status(404).json({
				message: MESSAGE.patch.fail
			});
		}

		return res.status(200).json({
			message: MESSAGE.patch.succ,
			result: updatedReview
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			message: MESSAGE.patch.fail,
			error
		});
	}
};

// Get All Reviews
export const getAllReviews = async (req: Request, res: Response) => {
	try {
		const reviews = await ReviewModel.find().populate("userId providerId");

		return res.status(200).json({
			message: MESSAGE.get.succ,
			result: reviews
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			message: MESSAGE.get.fail,
			error
		});
	}
};

export const deleteReview = async (req: Request, res: Response) => {
	try {
		const { id } = req.query;

		if (!id) {
			return res.status(400).json({
				message: "Review ID is required"
			});
		}

		const deletedReview = await ReviewModel.findByIdAndDelete(id);

		if (!deletedReview) {
			return res.status(404).json({
				message: "Review not found"
			});
		}

		return res.status(200).json({
			message: "Review deleted successfully",
			result: deletedReview
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			message: "Failed to delete review",
			error
		});
	}
};
// Get Reviews by Filter (userId, providerId, or rating)
export const getReviewsByFilter = async (req: Request, res: Response) => {
	try {
		const { userId, eventId, rating, review_status, page = 1, limit = 10 } = req.query;

		const filter: any = {};
		if (userId) filter.userId = userId;
		if (eventId) filter.eventId = eventId;
		if (rating) filter.rating = rating;
		if (review_status) filter.review_status = review_status;

		// Convert page and limit to numbers
		const pageNumber = Math.max(1, Number(page));
		const limitNumber = Math.max(1, Number(limit));

		// Fetch total count
		const totalReviews = await ReviewModel.countDocuments(filter);

		// Fetch paginated reviews
		const filteredReviews = await ReviewModel.find(filter)
			.populate("userId eventId")
			.skip((pageNumber - 1) * limitNumber)
			.limit(limitNumber);

		return res.status(200).json({
			message: MESSAGE.get.succ,
			page: pageNumber,
			limit: limitNumber,
			totalReviews,
			totalPages: Math.ceil(totalReviews / limitNumber),
			result: filteredReviews
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			message: MESSAGE.get.fail,
			error
		});
	}
};
