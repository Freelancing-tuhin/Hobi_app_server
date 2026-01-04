export interface IWallet {
	organizerId: string;
	balance: number;
	totalEarnings: number;
	totalWithdrawals: number;
	pendingWithdrawals: number;
	lastTransactionAt: Date | null;
	isActive: boolean;
}
