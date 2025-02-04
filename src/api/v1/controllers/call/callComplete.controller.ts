import { Request, Response } from "express";
import WalletModel from "../../../../models/wallet.model";
import CallModel from "../../../../models/call.model";

export const deductBalanceAndCompleteCall = async (req: Request, res: Response) => {
	try {
		const { callId } = req.body;

		const currentTime = new Date();

		const callData = await CallModel.aggregate([
			{ $match: { _id: callId, status: "ongoing", startedAt: { $exists: true } } },
			{
				$lookup: {
					from: "wallets",
					let: { userId: "$user", providerId: "$provider" },
					pipeline: [
						{
							$match: {
								$expr: { $or: [{ $eq: ["$userId", "$$userId"] }, { $eq: ["$userId", "$$providerId"] }] }
							}
						}
					],
					as: "wallets"
				}
			},
			{
				$project: {
					_id: 1,
					startedAt: 1,
					provider: 1,
					"wallets.userWallet": {
						$arrayElemAt: [
							{ $filter: { input: "$wallets", as: "wallet", cond: { $eq: ["$$wallet.type", "user"] } } },
							0
						]
					},
					"wallets.providerWallet": {
						$arrayElemAt: [
							{
								$filter: {
									input: "$wallets",
									as: "wallet",
									cond: { $eq: ["$$wallet.type", "provider"] }
								}
							},
							0
						]
					}
				}
			}
		]);

		if (!callData || callData.length === 0) {
			return res.status(400).json({ message: "Invalid call or wallets not found" });
		}

		const call = callData[0];
		const callDuration = Math.ceil((currentTime.getTime() - new Date(call.startedAt).getTime()) / 60000);
		const providerRatePerMinute = call.provider?.ratePerMinute || 0;
		const totalCost = callDuration * providerRatePerMinute;

		if (callDuration <= 0) {
			return res.status(400).json({ message: "Invalid call duration detected", duration: callDuration });
		}

		if (call.wallets.userWallet.balance < totalCost) {
			return res.status(400).json({ message: "Call ended due to insufficient balance", duration: callDuration });
		}

		// Update balances
		const userBalanceUpdate = WalletModel.updateOne(
			{ _id: call.wallets.userWallet._id },
			{ $inc: { balance: -totalCost } }
		);
		const providerBalanceUpdate = WalletModel.updateOne(
			{ _id: call.wallets.providerWallet._id },
			{ $inc: { balance: totalCost } }
		);
		const callUpdate = CallModel.updateOne({ _id: call._id }, { status: "completed", duration: callDuration });

		// Execute operations concurrently
		await Promise.all([userBalanceUpdate, providerBalanceUpdate, callUpdate]);

		return res.status(200).json({
			message: "Call successfully completed",
			result: { callId, duration: callDuration }
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({ message: "Failed to complete the call", error });
	}
};
