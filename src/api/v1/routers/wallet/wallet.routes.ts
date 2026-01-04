import { Router } from "express";
import {
	getWallet,
	requestWithdrawal,
	getWalletTransactions,
	getPendingWithdrawals,
	completeWithdrawal,
	rejectWithdrawal
} from "../../controllers/wallet/wallet.controller";

const router = Router();

// Get wallet details for an organizer
router.get("/", getWallet);

// Request withdrawal from wallet
router.post("/withdraw", requestWithdrawal);

// Get wallet transaction history
router.get("/transactions", getWalletTransactions);

// Admin: Get all pending withdrawals
router.get("/pending", getPendingWithdrawals);

// Admin: Complete/approve a pending withdrawal
router.patch("/complete", completeWithdrawal);

// Admin: Reject a pending withdrawal
router.patch("/reject", rejectWithdrawal);

module.exports = router;
