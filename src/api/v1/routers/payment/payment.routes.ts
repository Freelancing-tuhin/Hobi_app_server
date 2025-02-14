import { Router } from "express";
import { createOrder, verifyOrder } from "../../controllers/payment/payment.controller";

const router = Router();

router.post("/create-order", createOrder);

router.post("/verify-payment", verifyOrder);

module.exports = router;
