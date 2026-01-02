import { Request, Response, NextFunction } from "express";
import UserModel from "../../models/user.model";
import ProviderModel from "../../models/organizer.model";
import AdminModel from "../../models/admin.model";

export const checkUserExistenceMiddleware = async (req: Request, res: Response, next: NextFunction) => {
	const { email } = req.body;

	try {
		const existingUser = await UserModel.findOne({ email });
		if (existingUser) {
			return res.status(409).json({
				message: "User with this email already exists"
			});
		}

		next();
	} catch (err) {
		console.error("Error checking user existence:", err);
		return res.status(500).json({
			message: "Failed to check user existence",
			error: err
		});
	}
};

export const checkProviderExistenceMiddleware = async (req: Request, res: Response, next: NextFunction) => {
	const { phone } = req.body;

	try {
		const existingUser = await ProviderModel.findOne({ phone });
		if (existingUser) {
			return res.status(409).json({
				message: "User with this phone number already exists"
			});
		}

		next();
	} catch (err) {
		console.error("Error checking user existence:", err);
		return res.status(500).json({
			message: "Failed to check user existence",
			error: err
		});
	}
};

export const checkAdminExistenceMiddleware = async (req: Request, res: Response, next: NextFunction) => {
	const { phone } = req.body;

	try {
		const existingUser = await AdminModel.findOne({ phone });
		if (existingUser) {
			return res.status(409).json({
				message: "User with this phone number already exists"
			});
		}

		next();
	} catch (err) {
		console.error("Error checking user existence:", err);
		return res.status(500).json({
			message: "Failed to check user existence",
			error: err
		});
	}
};
