import express from "express";
import { createWallet, rechargeWallet, updateWalletBalance } from "../../controllers/wallet/wallet.controller";

const router = express.Router();

router.route("/create").post(createWallet);

router.route("/update-balance").put(updateWalletBalance);

router.route("/recharge").post(rechargeWallet);

module.exports = router;
