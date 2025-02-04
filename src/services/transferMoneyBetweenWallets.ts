import WalletModel from "../models/wallet.model";

export const transferMoneyBetweenWallets = async (userId: string, providerId: string, amount: number) => {
	try {
		if (amount <= 0) {
			return { success: false, message: "Amount should be greater than zero" };
		}

		// Fetch user and provider wallets concurrently
		const [userWallet, providerWallet] = await Promise.all([
			WalletModel.findOne({ owner: userId, ownerType: "users" }),
			WalletModel.findOne({ owner: providerId, ownerType: "service_providers" })
		]);

		if (!userWallet || !providerWallet) {
			return { success: false, message: "Wallets not found for the users" };
		}

		if (userWallet.balance < amount) {
			return { success: false, message: "Insufficient balance in user wallet" };
		}

		// Update wallet balances
		userWallet.balance -= amount;
		providerWallet.balance += amount;

		await Promise.all([userWallet.save(), providerWallet.save()]);

		return {
			success: true,
			message: "Money successfully transferred",
			data: {
				userWalletBalance: userWallet.balance,
				providerWalletBalance: providerWallet.balance
			}
		};
	} catch (error) {
		console.error("Error transferring money between wallets:", error);
		return { success: false, message: "Transaction failed", error };
	}
};
