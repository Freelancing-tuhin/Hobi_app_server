import { Request, Response } from "express";
import ProviderModel from "../../../../models/organizer.model";
import axios from "axios";
import { createHmac } from "crypto";
import Razorpay from "razorpay";
import { RAZORPAY_CONFIG } from "../../../../config/config";

export const createOrder = async (req: Request, res: Response) => {
	try {
		const instance = new Razorpay({ key_id: RAZORPAY_CONFIG.KEY_ID, key_secret: RAZORPAY_CONFIG.KEY_SECRET });
		const { amount, currency, receipt } = req.body;

		const response = await instance.orders.create({
			amount: Math.round(amount * 100),
			currency: "INR",
			receipt: receipt,
			notes: {
				key1: "value3",
				key2: "value2"
			}
		});

		return res.status(200).json(response);
	} catch (error) {
		console.error("Error creating order:", error);
		return res.status(500).json({ error: "Failed to create order." });
	}
};

export const verifyOrder = async (req: Request, res: Response) => {
	try {
		const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

		if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
			return res.status(400).json({ error: "Missing payment details." });
		}

		// Create the expected signature using HMAC-SHA256
		const generatedSignature = createHmac("sha256", RAZORPAY_CONFIG.KEY_SECRET)
			.update(`${razorpay_order_id}|${razorpay_payment_id}`)
			.digest("hex");

		if (generatedSignature === razorpay_signature) {
			return res.status(200).json({ message: "Payment verification successful." });
		} else {
			return res.status(400).json({ error: "Payment verification failed." });
		}
	} catch (error) {
		console.error("Error verifying payment:", error);
		return res.status(500).json({ error: "Internal server error." });
	}
};
