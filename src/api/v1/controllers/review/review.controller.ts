import { Request, Response } from "express";
import ReviewModel from "../../../../models/review.model";
import { MESSAGE } from "../../../../constants/message";
import ProviderModel from "../../../../models/organizer.model";

// Create Review
export const createReview = async (req: Request, res: Response) => {
	try {
		const { comment, rating, userId, providerId } = req.body;

		// Save the new review
		const newReview = await new ReviewModel({
			comment,
			rating,
			userId,
			providerId
		}).save();

		// Fetch all reviews for the given provider to recalculate the average rating
		const reviews = await ReviewModel.find({ providerId });

		if (reviews.length > 0) {
			const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
			const averageRating = totalRatings / reviews.length;

			// Update provider's average rating
			await ProviderModel.findByIdAndUpdate(providerId, { ratings: averageRating });
		}

		return res.status(200).json({
			message: MESSAGE.post.succ,
			result: newReview
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
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

// Get Reviews by Filter (userId, providerId, or rating)
export const getReviewsByFilter = async (req: Request, res: Response) => {
	try {
		const { userId, providerId, rating } = req.query;
		const filter: any = {};

		if (userId) filter.userId = userId;
		if (providerId) filter.providerId = providerId;
		if (rating) filter.rating = rating;

		const filteredReviews = await ReviewModel.find(filter).populate("userId providerId");

		return res.status(200).json({
			message: MESSAGE.get.succ,
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
