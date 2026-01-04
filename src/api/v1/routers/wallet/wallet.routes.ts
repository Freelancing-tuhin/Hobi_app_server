import { Router } from "express";
import {
	getWallet,
	requestWithdrawal,
	getWalletTransactions
} from "../../controllers/wallet/wallet.controller";

const router = Router();

// Get wallet details for an organizer
router.get("/", getWallet);

// Request withdrawal from wallet
router.post("/withdraw", requestWithdrawal);

// Get wallet transaction history
router.get("/transactions", getWalletTransactions);

module.exports = router;
