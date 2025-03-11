import mongoose, { Schema, Document } from "mongoose";
import { MESSAGE } from "../../constants/message";
import { Request, Response } from "express";
// Define an interface for the data
interface IData extends Document {
	title: string;
	description: string;
	data: any;
	dataType: string;
	sending_to: mongoose.Types.ObjectId;
	sending_to_type: "user" | "organizer";
	sending_from: mongoose.Types.ObjectId;
	sending_from_type: "admin" | "organizer";
}

// Create Mongoose schema
const DataSchema: Schema = new Schema(
	{
		title: { type: String, required: true },
		description: { type: String, required: true },
		data: { type: Schema.Types.Mixed, required: true },
		dataType: { type: String, required: true },
		sending_to: { type: String, required: true },
		sending_to_type: { type: String, required: true },
		sending_from: { type: String, required: true },
		sending_from_type: { type: String, required: true }
	},
	{ timestamps: true }
);

// Create Mongoose model
const NotificationModel = mongoose.model<IData>("notification", DataSchema);

// Service function to create a new data entry
export const createNotification = async (
	title: string,
	description: string,
	data: any,
	dataType: string,
	sending_to: string,
	sending_to_type: string,
	sending_from: string,
	sending_from_type: string
): Promise<IData | null> => {
	try {
		const newData = new NotificationModel({
			title,
			description,
			data,
			dataType,
			sending_to,
			sending_to_type,
			sending_from,
			sending_from_type
		});
		return await newData.save();
	} catch (error) {
		console.error("Error creating data entry:", error);
		return null;
	}
};

export const getNotificationsByReceiver = async (req: Request, res: Response) => {
	try {
		const { sending_to } = req.query;
		// console.log("======>sending to", sending_to);
		const notifications = await NotificationModel.find({ sending_to }).sort({
			createdAt: -1
		});
		return res.status(200).json({
			message: MESSAGE.post.succ,
			result: notifications
		});
	} catch (error) {
		console.error("Error fetching notifications:", error);
		return null;
	}
};
