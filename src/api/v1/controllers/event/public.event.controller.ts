import { Request, Response } from "express";
import EventModel from "../../../../models/event.model";
import BookingModel from "../../../../models/booking.model";
import { MESSAGE } from "../../../../constants/message";
import mongoose from "mongoose";

export const getEventById = async (req: Request, res: Response) => {
	try {
		const { eventId, userId }: any = req.query;

		if (!mongoose.Types.ObjectId.isValid(eventId)) {
			return res.status(400).json({
				message: MESSAGE.get.custom("Invalid event ID")
			});
		}

		// Perform aggregation to join event and check booking status
		const event = await EventModel.aggregate([
			{ $match: { _id: new mongoose.Types.ObjectId(eventId) } },
			{
				$lookup: {
					from: "bookings", // Assuming "bookings" is the name of the collection
					localField: "_id",
					foreignField: "eventId",
					as: "bookingDetails"
				}
			},
			{
				$unwind: {
					path: "$bookingDetails",
					preserveNullAndEmptyArrays: true // Keep event even if no booking exists
				}
			},
			{
				$addFields: {
					booking_status: {
						$cond: {
							if: { $eq: ["$bookingDetails.userId", new mongoose.Types.ObjectId(userId)] },
							then: true,
							else: false
						}
					}
				}
			},
			{
				$lookup: {
					from: "organizers", // Assuming "users" is the name of the collection
					localField: "organizerId",
					foreignField: "_id",
					as: "organizerDetails"
				}
			},
			{
				$project: {
					"organizerDetails.password": 0, // Hide password field from the response
					"bookingDetails.userId": 0, // Hide userId from the booking details
					"organizerDetails.PAN": 0, // Hide PAN field
					"organizerDetails.GST": 0, // Hide GST field
					"organizerDetails.bank_account": 0, // Hide bank account field
					"organizerDetails.bank_account_type": 0, // Hide bank account type field
					"organizerDetails.IFSC_code": 0, // Hide IFSC code field
					"organizerDetails.certificate_of_incorporation": 0, // Hide certificate of incorporation field
					"organizerDetails.licenses_for_establishment": 0, // Hide licenses for establishment field
					"organizerDetails.licenses_for_activity_undertaken": 0, // Hide licenses for activity undertaken field
					"organizerDetails.certifications": 0, // Hide certifications field
					"organizerDetails.insurance_for_outdoor_activities": 0, // Hide insurance for outdoor activities field
					"organizerDetails.health_safety_documents": 0 // Hide health safety documents field
				}
			}
		]);

		if (event.length === 0) {
			return res.status(404).json({
				message: MESSAGE.get.custom("Event not found")
			});
		}

		// If booking exists, include it in the result
		const result = event[0];
		if (result.bookingDetails) {
			result.booking_status = true; // Booking exists for this user
		} else {
			result.booking_status = false; // No booking exists for this user
		}

		return res.status(200).json({
			message: MESSAGE.get.succ,
			result
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			message: MESSAGE.get.fail,
			error
		});
	}
};
