import { Request, Response } from "express";
import TransactionModel from "../../../../models/transaction.model";
import { MESSAGE } from "../../../../constants/message";

export const createTransaction = async (req: Request, res: Response) => {
	try {
		const { type, amount, status, senderId, receiverId, reference } = req.body;

		const newTransaction = await new TransactionModel({
			type,
			amount,
			status,
			senderId,
			receiverId,
			reference
		}).save();

		return res.status(200).json({
			message: MESSAGE.post.succ,
			result: newTransaction
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			message: MESSAGE.post.fail,
			error: error
		});
	}
};

export const getTransactions = async (req: Request, res: Response) => {
	try {
		const { page = 1, limit = 10, amount, status, type } = req.query;
		const pageNumber = parseInt(page as string, 10);
		const limitNumber = parseInt(limit as string, 10);

		const filter: any = {};
		if (amount) {
			const regex = new RegExp(amount as string, "i");
			filter.amount = { $regex: regex };
		}
		if (status) {
			filter.status = status;
		}
		if (type) {
			filter.type = type;
		}

		const transactions = await TransactionModel.find(filter)
			.sort({ createdAt: -1 })
			.skip((pageNumber - 1) * limitNumber)
			.limit(limitNumber);

		const total = await TransactionModel.countDocuments(filter);

		return res.status(200).json({
			message: MESSAGE.get.succ,
			result: transactions,
			pagination: {
				total,
				page: pageNumber,
				limit: limitNumber,
				totalPages: Math.ceil(total / limitNumber)
			}
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			message: MESSAGE.get.fail,
			error: error
		});
	}
};
