import TransactionModel from "../models/transaction.model";
import { ITransaction } from "../types/interface/transcation.interface";

/**
 * Transaction Service
 * Handles all transaction-related database operations
 */

export interface CreateTransactionParams {
	type: "credit" | "debit" | "transfer" | "bill_payment" | "booking";
	amount: any;
	senderId: string;
	receiverId?: string;
	reference?: string;
	platformFee?: any;
	orderId?: string;
	razorPay_payment_id?: string;
}

/**
 * Create a new transaction record
 * @param params - Transaction details
 * @returns Created transaction document
 */
export const createTransaction = async (params: CreateTransactionParams): Promise<ITransaction> => {
	try {
		const transaction = new TransactionModel({
			type: params.type,
			amount: params.amount,
			senderId: params.senderId,
			receiverId: params.receiverId || null,
			reference: params.reference || null,
			platformFee: params.platformFee || null,
			orderId: params.orderId || null,
			razorPay_payment_id: params.razorPay_payment_id || null
		});

		const savedTransaction = await transaction.save();
		return savedTransaction;
	} catch (error) {
		console.error("Error creating transaction:", error);
		throw error;
	}
};

/**
 * Get transaction by ID
 * @param transactionId - Transaction ID
 * @returns Transaction document or null
 */
export const getTransactionById = async (transactionId: string): Promise<ITransaction | null> => {
	try {
		const transaction = await TransactionModel.findById(transactionId).lean();
		return transaction;
	} catch (error) {
		console.error("Error fetching transaction:", error);
		throw error;
	}
};

/**
 * Get transactions by sender ID
 * @param senderId - Sender ID
 * @returns Array of transaction documents
 */
export const getTransactionsBySenderId = async (senderId: string): Promise<ITransaction[]> => {
	try {
		const transactions = await TransactionModel.find({ senderId }).sort({ createdAt: -1 }).lean();
		return transactions;
	} catch (error) {
		console.error("Error fetching transactions:", error);
		throw error;
	}
};

/**
 * Get transaction by order ID
 * @param orderId - Order ID (Razorpay order ID)
 * @returns Transaction document or null
 */
export const getTransactionByOrderId = async (orderId: string): Promise<ITransaction | null> => {
	try {
		const transaction = await TransactionModel.findOne({ orderId }).lean();
		return transaction;
	} catch (error) {
		console.error("Error fetching transaction by order ID:", error);
		throw error;
	}
};

/**
 * Get transaction by reference (transaction ID from payment gateway)
 * @param reference - Reference/Transaction ID
 * @returns Transaction document or null
 */
export const getTransactionByReference = async (reference: string): Promise<ITransaction | null> => {
	try {
		const transaction = await TransactionModel.findOne({ reference }).lean();
		return transaction;
	} catch (error) {
		console.error("Error fetching transaction by reference:", error);
		throw error;
	}
};
