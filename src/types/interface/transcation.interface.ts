export interface ITransaction {
	type: "credit" | "debit" | "transfer" | "bill_payment" | "booking";
	amount: string;
	status: "success" | "failed" | "pending";
	senderId: string;
	receiverId?: string;
	reference?: string;
}
