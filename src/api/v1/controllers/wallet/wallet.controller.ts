import { Request, Response } from "express";
import { MESSAGE } from "../../../../constants/message";
import { 
	getOrCreateWallet, 
	getWalletByOrganizerId, 
	addPendingWithdrawal 
} from "../../../../services/wallet.service";
import { createTransaction } from "../../../../services/transaction.service";
import TransactionModel from "../../../../models/transaction.model";

/**
 * Get wallet details for an organizer
 */
export const getWallet = async (req: Request, res: Response) => {
	try {
		const { organizerId } = req.query;

		if (!organizerId) {
			return res.status(400).json({
				message: MESSAGE.get.custom("Organizer ID is required")
			});
		}

		const wallet = await getOrCreateWallet(organizerId as string);

		return res.status(200).json({
			message: MESSAGE.get.succ,
			result: wallet
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			message: MESSAGE.get.fail,
			error
		});
	}
};

/**
 * Request withdrawal from wallet
 */
export const requestWithdrawal = async (req: Request, res: Response) => {
	try {
		const { organizerId, amount, bankDetails } = req.body;

		if (!organizerId || !amount) {
			return res.status(400).json({
				message: MESSAGE.post.custom("Organizer ID and amount are required")
			});
		}

		if (amount <= 0) {
			return res.status(400).json({
				message: MESSAGE.post.custom("Amount must be greater than 0")
			});
		}

		// Check wallet balance
		const wallet = await getWalletByOrganizerId(organizerId);
		if (!wallet) {
			return res.status(404).json({
				message: MESSAGE.post.custom("Wallet not found")
			});
		}

		if (wallet.balance < amount) {
			return res.status(400).json({
				message: MESSAGE.post.custom("Insufficient balance"),
				availableBalance: wallet.balance
			});
		}

		// Add to pending withdrawals (deducts from available balance)
		const updatedWallet = await addPendingWithdrawal(organizerId, amount);

		// Create transaction record for the withdrawal request
		const transaction: any = await createTransaction({
			type: "wallet_debit",
			amount: amount,
			senderId: organizerId,
			receiverId: undefined,
			reference: `WITHDRAWAL_${Date.now()}`,
			walletId: (wallet as any)._id?.toString() || organizerId,
			withdrawalStatus: "pending"
		});

		return res.status(200).json({
			message: MESSAGE.post.succ,
			result: {
				wallet: updatedWallet,
				transaction: transaction,
				withdrawalId: transaction._id
			}
		});
	} catch (error: any) {
		console.error(error);
		return res.status(400).json({
			message: error.message || MESSAGE.post.fail,
			error
		});
	}
};

/**
 * Get wallet transaction history
 */
export const getWalletTransactions = async (req: Request, res: Response) => {
	try {
		const { organizerId, page = 1, limit = 20 } = req.query;

		if (!organizerId) {
			return res.status(400).json({
				message: MESSAGE.get.custom("Organizer ID is required")
			});
		}

		const pageNumber = parseInt(page as string) || 1;
		const limitNumber = parseInt(limit as string) || 20;
		const skip = (pageNumber - 1) * limitNumber;

		// Get all wallet-related transactions for this organizer
		const transactions = await TransactionModel.find({
			$or: [
				{ senderId: organizerId, type: { $in: ["wallet_credit", "wallet_debit"] } },
				{ receiverId: organizerId, type: { $in: ["wallet_credit", "wallet_debit"] } }
			]
		})
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limitNumber)
			.lean();

		const totalTransactions = await TransactionModel.countDocuments({
			$or: [
				{ senderId: organizerId, type: { $in: ["wallet_credit", "wallet_debit"] } },
				{ receiverId: organizerId, type: { $in: ["wallet_credit", "wallet_debit"] } }
			]
		});

		const totalPages = Math.ceil(totalTransactions / limitNumber);

		return res.status(200).json({
			message: MESSAGE.get.succ,
			result: transactions,
			pagination: {
				totalTransactions,
				totalPages,
				currentPage: pageNumber,
				limit: limitNumber
			}
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			message: MESSAGE.get.fail,
			error
		});
	}
};
