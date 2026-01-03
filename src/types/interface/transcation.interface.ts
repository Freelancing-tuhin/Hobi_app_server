export interface ITransaction {
	type: "credit" | "debit" | "transfer" | "bill_payment" | "booking";
	amount: any;
	senderId: string;
	receiverId?: string;
	reference?: string;
	platformFee?: any;
	orderId?: string;
	razorPay_payment_id?: string;
}
