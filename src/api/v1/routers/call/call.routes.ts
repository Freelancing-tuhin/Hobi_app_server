import { Router } from "express";
import {
	acceptCallRequest,
	cancelCallRequest,
	completeCall,
	requestCall,
	walletUpdateCall
} from "../../controllers/call/call.controller";
import { deductBalanceAndCompleteCall } from "../../controllers/call/callCOmplete.controller";

const router = Router();

router.post("/request", requestCall);

router.patch("/accept", acceptCallRequest);

router.patch("/cancel", cancelCallRequest);

router.patch("/complete", completeCall);

router.patch("/wallet_update_call", walletUpdateCall);

module.exports = router;
