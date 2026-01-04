import WalletModel from "../models/wallet.model";
import { IWallet } from "../types/interface/wallet.interface";

/**
 * Wallet Service
 * Handles all wallet-related database operations
 */

/**
 * Get wallet by organizer ID, create if doesn't exist
 * @param organizerId - Organizer ID
 * @returns Wallet document
 */
export const getOrCreateWallet = async (organizerId: string): Promise<IWallet> => {
	try {
		console.log("====>calling wallet")
		let wallet = await WalletModel.findOne({ organizerId });
		
		if (!wallet) {
			console.log("====>wallet created ")
			wallet = new WalletModel({
				organizerId,
				balance: 0,
				totalEarnings: 0,
				totalWithdrawals: 0,
				pendingWithdrawals: 0,
				lastTransactionAt: null,
				isActive: true
			});
			await wallet.save();
		}
		
		return wallet;
	} catch (error) {
		console.error("Error getting/creating wallet:", error);
		throw error;
	}
};

/**
 * Get wallet by organizer ID
 * @param organizerId - Organizer ID
 * @returns Wallet document or null
 */
export const getWalletByOrganizerId = async (organizerId: string): Promise<IWallet | null> => {
	try {
		const wallet = await WalletModel.findOne({ organizerId }).lean();
		return wallet;
	} catch (error) {
		console.error("Error fetching wallet:", error);
		throw error;
	}
};

/**
 * Credit wallet - Add funds to wallet (on ticket purchase)
 * @param organizerId - Organizer ID
 * @param amount - Amount to credit
 * @returns Updated wallet document
 */
export const creditWallet = async (organizerId: string, amount: number): Promise<IWallet> => {
	try {
		// Ensure wallet exists
		await getOrCreateWallet(organizerId);
		
		const wallet = await WalletModel.findOneAndUpdate(
			{ organizerId },
			{
				$inc: {
					balance: amount,
					totalEarnings: amount
				},
				$set: {
					lastTransactionAt: new Date()
				}
			},
			{ new: true }
		);
		console.log("====>wallet credited")
		if (!wallet) {
			throw new Error("Wallet not found after credit");
		}
		
		return wallet;
	} catch (error) {
		console.error("Error crediting wallet:", error);
		throw error;
	}
};

/**
 * Debit wallet - Remove funds from wallet (on withdrawal)
 * @param organizerId - Organizer ID
 * @param amount - Amount to debit
 * @returns Updated wallet document
 */
export const debitWallet = async (organizerId: string, amount: number): Promise<IWallet> => {
	try {
		const wallet = await WalletModel.findOne({ organizerId });
		
		if (!wallet) {
			throw new Error("Wallet not found");
		}
		
		if (wallet.balance < amount) {
			throw new Error("Insufficient balance");
		}
		
		const updatedWallet = await WalletModel.findOneAndUpdate(
			{ organizerId },
			{
				$inc: {
					balance: -amount,
					totalWithdrawals: amount
				},
				$set: {
					lastTransactionAt: new Date()
				}
			},
			{ new: true }
		);
		
		if (!updatedWallet) {
			throw new Error("Wallet not found after debit");
		}
		
		return updatedWallet;
	} catch (error) {
		console.error("Error debiting wallet:", error);
		throw error;
	}
};

/**
 * Add to pending withdrawals
 * @param organizerId - Organizer ID
 * @param amount - Amount to add to pending
 * @returns Updated wallet document
 */
export const addPendingWithdrawal = async (organizerId: string, amount: number): Promise<IWallet> => {
	try {
		const wallet = await WalletModel.findOne({ organizerId });
		
		if (!wallet) {
			throw new Error("Wallet not found");
		}
		
		if (wallet.balance < amount) {
			throw new Error("Insufficient balance for withdrawal");
		}
		
		const updatedWallet = await WalletModel.findOneAndUpdate(
			{ organizerId },
			{
				$inc: {
					balance: -amount,
					pendingWithdrawals: amount
				},
				$set: {
					lastTransactionAt: new Date()
				}
			},
			{ new: true }
		);
		
		if (!updatedWallet) {
			throw new Error("Wallet not found after update");
		}
		
		return updatedWallet;
	} catch (error) {
		console.error("Error adding pending withdrawal:", error);
		throw error;
	}
};

/**
 * Complete pending withdrawal
 * @param organizerId - Organizer ID
 * @param amount - Amount to complete
 * @returns Updated wallet document
 */
export const completePendingWithdrawal = async (organizerId: string, amount: number): Promise<IWallet> => {
	try {
		const wallet = await WalletModel.findOne({ organizerId });
		
		if (!wallet) {
			throw new Error("Wallet not found");
		}
		
		if (wallet.pendingWithdrawals < amount) {
			throw new Error("Amount exceeds pending withdrawals");
		}
		
		const updatedWallet = await WalletModel.findOneAndUpdate(
			{ organizerId },
			{
				$inc: {
					pendingWithdrawals: -amount,
					totalWithdrawals: amount
				},
				$set: {
					lastTransactionAt: new Date()
				}
			},
			{ new: true }
		);
		
		if (!updatedWallet) {
			throw new Error("Wallet not found after update");
		}
		
		return updatedWallet;
	} catch (error) {
		console.error("Error completing pending withdrawal:", error);
		throw error;
	}
};
