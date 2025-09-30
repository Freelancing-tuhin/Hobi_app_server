import { Request, Response } from "express";

import { MESSAGE } from "../../../../constants/message";
import { generateOtp } from "../../../../services/generateOtp";
import { encryptData } from "../../../../services/encryptData";

export const getOtp = async (req: Request, res: Response) => {
	try {
		const { phone } = req.body;

		const response = await generateOtp(phone);
		console.log("===>response", response);

		return res.status(200).json({ message: MESSAGE.post.succ, result: encryptData(response) });
	} catch (error) {
		console.error("Error Generating OTP:", error);
		res.status(400).json({ message: MESSAGE.post.fail, error: error });
	}
};
