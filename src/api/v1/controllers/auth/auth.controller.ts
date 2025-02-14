import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../../../../models/user.model";
import { MESSAGE } from "../../../../constants/message";
import { JWT_SECRET } from "../../../../config/config";
import ProviderModel from "../../../../models/provider.model";
import AdminModel from "../../../../models/admin.model";

export const signUpUser = async (req: Request, res: Response) => {
	try {
		const { full_name, age, email, gender, address, password } = req.body;

		const newUser = await new UserModel({
			full_name,
			age,
			email,
			gender,
			address,
			password
		}).save();

		const token = jwt.sign({ id: newUser._id }, JWT_SECRET);

		return res.status(200).json({
			message: MESSAGE.post.succ,
			token,
			result: newUser
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			message: MESSAGE.post.fail,
			error: error
		});
	}
};

export const loginUser = async (req: any, res: Response) => {
	try {
		const userInstance = req.user;

		const token = jwt.sign({ id: userInstance._id }, JWT_SECRET);

		return res.status(200).json({
			message: MESSAGE.post.succ,
			token,
			result: userInstance
		});
	} catch (error) {
		console.error("Error during login:", error);
		return res.status(400).json({
			message: MESSAGE.post.fail,
			error: error
		});
	}
};

export const signUpProvider = async (req: Request, res: Response) => {
	try {
		const { full_name, age, phone, gender, address, password, profile_pic, provided_service } = req.body;

		const newUser = await new ProviderModel({
			full_name,
			age,
			phone,
			gender,
			address,
			password,
			profile_pic,
			provided_service
		}).save();

		const token = jwt.sign({ id: newUser._id }, JWT_SECRET);

		return res.status(200).json({
			message: MESSAGE.post.succ,
			token,
			result: newUser
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			message: MESSAGE.post.fail,
			error: error
		});
	}
};

export const loginProvider = async (req: any, res: Response) => {
	try {
		const userInstance = req.user;

		const token = jwt.sign({ id: userInstance._id }, JWT_SECRET);

		return res.status(200).json({
			message: MESSAGE.post.succ,
			token,
			result: userInstance
		});
	} catch (error) {
		console.error("Error during login:", error);
		return res.status(400).json({
			message: MESSAGE.post.fail,
			error: error
		});
	}
};

export const signUpAdmin = async (req: Request, res: Response) => {
	try {
		const { full_name, phone, password, role } = req.body;

		const temprole = role || "ADMIN";

		const newUser = await new AdminModel({
			full_name,
			phone,
			password,
			role: temprole
		}).save();

		const token = jwt.sign({ id: newUser._id }, JWT_SECRET);

		return res.status(200).json({
			message: MESSAGE.post.succ,
			token,
			result: newUser
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			message: MESSAGE.post.fail,
			error: error
		});
	}
};

export const loginAdmin = async (req: any, res: Response) => {
	try {
		const userInstance = req.user;

		return res.status(200).json({
			message: MESSAGE.post.succ,
			result: userInstance
		});
	} catch (error) {
		console.error("Error during login:", error);
		return res.status(400).json({
			message: MESSAGE.post.fail,
			error: error
		});
	}
};
