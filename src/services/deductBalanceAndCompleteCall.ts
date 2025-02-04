import CallModel from "../models/call.model";
import WalletModel from "../models/wallet.model";

export async function deductBalanceAndCompleteCall(callId: string, ratePerMinute: number, userWalletId: string) {
    let duration = 0;
    let callActive = true;
  
    while (callActive) {
      const userWallet = await WalletModel.findById(userWalletId);
  
      if (!userWallet || userWallet.balance < ratePerMinute) {
        // End the call due to insufficient funds
        callActive = false;
        await CallModel.findByIdAndUpdate(
          callId,
          { status: "completed", duration },
          { new: true }
        );
        return { success: false, duration };
      }
  
      // Deduct wallet balance
      userWallet.balance -= ratePerMinute;
      await userWallet.save();
  
      // Wait for 1 minute before deducting again
      await new Promise((resolve) => setTimeout(resolve, 60000));
      duration += 1;
    }
  }