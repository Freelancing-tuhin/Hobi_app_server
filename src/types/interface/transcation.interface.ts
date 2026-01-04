export interface ITransaction {
	type: "credit" | "debit" | "transfer" | "bill_payment" | "booking" | "wallet_credit" | "wallet_debit";
	amount: any;
	senderId: string;
	receiverId?: string;
	reference?: string;
	platformFee?: any;
	orderId?: string;
	razorPay_payment_id?: string;
	walletId?: string;
	bookingId?: string;
	withdrawalStatus?: "pending" | "completed" | "failed" | null;
}

