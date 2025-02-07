import { Request, Response } from "express";
import CallModel from "../../../../models/call.model";
import { MESSAGE } from "../../../../constants/message";
import { transferMoneyBetweenWallets } from "../../../../services/transferMoneyBetweenWallets";
import { differenceInMinutes } from "date-fns";
export const requestCall = async (req: Request, res: Response) => {
	try {
		const { userId, providerId } = req.body;

		const newCallRequest = new CallModel({
			user: userId,
			provider: providerId,
			status: "requested"
		});

		await newCallRequest.save();

		return res.status(200).json({
			message: MESSAGE.post.succ,
			result: newCallRequest
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			message: MESSAGE.post.fail,
			error
		});
	}
};

export const acceptCallRequest = async (req: Request, res: Response) => {
	try {
		const { callId, status, scheduledAt } = req.body;

		if (!["ongoing", "scheduled"].includes(status)) {
			return res.status(400).json({
				message: "Invalid status. Only 'ongoing' or 'scheduled' is allowed."
			});
		}

		const updateFields: any = { status };
		if (status === "scheduled") {
			updateFields.scheduledAt = scheduledAt;
		} else if (status === "ongoing") {
			updateFields.startedAt = new Date(); // Set current time for ongoing calls
		}

		const updatedCall = await CallModel.findByIdAndUpdate(callId, updateFields, {
			new: true
		});

		if (!updatedCall) {
			return res.status(404).json({ message: "Call request not found" });
		}

		return res.status(200).json({
			message: MESSAGE.patch.succ,
			result: updatedCall
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			message: MESSAGE.patch.fail,
			error
		});
	}
};
export const cancelCallRequest = async (req: Request, res: Response) => {
	try {
		const { callId } = req.body;

		const updatedCall = await CallModel.findByIdAndUpdate(callId, { status: "canceled" }, { new: true });

		if (!updatedCall) {
			return res.status(404).json({ message: "Call request not found" });
		}

		return res.status(200).json({
			message: MESSAGE.patch.succ,
			result: updatedCall
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			message: MESSAGE.patch.fail,
			error
		});
	}
};

export const walletUpdateCall = async (req: Request, res: Response) => {
	try {
		const { callId } = req.body;

		const call = await CallModel.findById(callId).populate("provider");

		if (!call || call.status !== "ongoing") {
			return res.status(400).json({ message: "Invalid call to complete" });
		}

		const providerRatePerMinute = call.provider?.ratePerMinute || 0;
		const totalAmount = providerRatePerMinute;
		const result = await transferMoneyBetweenWallets(call?.user, call?.provider?._id, totalAmount);

		return res.status(200).json({
			message: MESSAGE.patch.succ,
			result: result
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			message: MESSAGE.patch.fail,
			error
		});
	}
};

export const completeCall = async (req: Request, res: Response) => {
	try {
		const { callId, walletId } = req.body;

		const call: any = await CallModel.findById(callId).populate("provider");

		if (!call || call.status !== "ongoing") {
			return res.status(400).json({ message: "Invalid call to complete" });
		}

		const currentTime: any = new Date();
		const durationInMilliseconds = currentTime - call?.startedAt;

		// Convert milliseconds to minutes (including fractional seconds)
		const durationInMinutes = Math.max(durationInMilliseconds / 60000, 1);

		const providerRatePerMinute = call.provider?.ratePerMinute || 0;
		const totalAmount = providerRatePerMinute * durationInMinutes;
		const result = await transferMoneyBetweenWallets(call?.user, call?.provider?._id, totalAmount);
		call.status = "completed";
		call.endedAt = currentTime;
		call.duration = durationInMinutes;
		call.callCost = totalAmount;

		await call.save();

		return res.status(200).json({
			message: MESSAGE.patch.succ,
			result: call
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			message: MESSAGE.patch.fail,
			error
		});
	}
};
