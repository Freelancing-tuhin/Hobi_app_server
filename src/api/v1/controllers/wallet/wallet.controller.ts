import { Request, Response } from "express";
import WalletModel from "../../../../models/wallet.model";
import { MESSAGE } from "../../../../constants/message";
import mongoose from "mongoose";

// Create Wallet
export const createWallet = async (req: Request, res: Response) => {
	try {
		const { ownerId, ownerType } = req.body;

		// Validate owner type
		if (!["users", "service_providers"].includes(ownerType)) {
			return res.status(400).json({ message: "Invalid owner type" });
		}

		// Check if a wallet already exists
		const existingWallet = await WalletModel.findOne({ owner: ownerId, ownerType });

		if (existingWallet) {
			return res.status(400).json({ message: "Wallet already exists for this owner" });
		}

		// Create a new wallet
		const newWallet = await new WalletModel({
			owner: ownerId,
			ownerType,
			balance: 0
		}).save();

		return res.status(201).json({
			message: MESSAGE.post.succ,
			result: newWallet
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: MESSAGE.post.fail,
			error
		});
	}
};

// Update Wallet Balance (Add or Deduct)
export const updateWalletBalance = async (req: Request, res: Response) => {
	try {
		const { ownerId, ownerType, amount } = req.body;

		if (!mongoose.Types.ObjectId.isValid(ownerId)) {
			return res.status(400).json({ message: "Invalid owner ID" });
		}

		// Validate owner type
		if (!["users", "service_providers"].includes(ownerType)) {
			return res.status(400).json({ message: "Invalid owner type" });
		}

		// Fetch the wallet
		const wallet = await WalletModel.findOne({ owner: ownerId, ownerType });

		if (!wallet) {
			return res.status(404).json({ message: "Wallet not found" });
		}

		// Update balance
		wallet.balance = (wallet.balance || 0) + amount;

		if (wallet.balance < 0) {
			return res.status(400).json({ message: "Insufficient balance" });
		}

		await wallet.save();

		return res.status(200).json({
			message: MESSAGE.put.succ,
			result: wallet
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: MESSAGE.put.fail,
			error
		});
	}
};

// Recharge Wallet
export const rechargeWallet = async (req: Request, res: Response) => {
	try {
		const { ownerId, ownerType, rechargeAmount } = req.body;

		if (!mongoose.Types.ObjectId.isValid(ownerId)) {
			return res.status(400).json({ message: "Invalid owner ID" });
		}

		// Validate recharge amount
		if (rechargeAmount <= 0) {
			return res.status(400).json({ message: "Recharge amount must be positive" });
		}

		// Fetch the wallet
		const wallet = await WalletModel.findOne({ owner: ownerId, ownerType });

		if (!wallet) {
			return res.status(404).json({ message: "Wallet not found" });
		}

		// Recharge balance
		wallet.balance = (wallet.balance || 0) + rechargeAmount;
		await wallet.save();

		return res.status(200).json({
			message: "Wallet recharged successfully",
			result: wallet
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: "Failed to recharge wallet",
			error
		});
	}
};
