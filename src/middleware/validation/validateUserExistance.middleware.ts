import { Request, Response, NextFunction } from "express";
import UserModel from "../../models/user.model";
import ProviderModel from "../../models/organizer.model";
import AdminModel from "../../models/admin.model";

export const validateUserExistenceMiddleware = async (req: any, res: Response, next: NextFunction) => {
	const { email } = req.body;

	try {
		const userInstance = await UserModel.findOne({ email });
		if (!userInstance) {
			return res.status(404).json({
				message: "User does not exist"
			});
		}

		req.user = userInstance;
		next();
	} catch (err) {
		console.error("Error checking user existence:", err);
		return res.status(500).json({
			message: "Failed to check user existence",
			error: err
		});
	}
};

export const validateProviderExistenceMiddleware = async (req: any, res: Response, next: NextFunction) => {
	const { phone } = req.body;

	try {
		const userInstance = await ProviderModel.findOne({ phone });
		if (!userInstance) {
			return res.status(404).json({
				message: "User does not exist"
			});
		}

		// Attach user instance to the request for further processing
		req.user = userInstance;
		next();
	} catch (err) {
		console.error("Error checking user existence:", err);
		return res.status(500).json({
			message: "Failed to check user existence",
			error: err
		});
	}
};

export const validateAdminExistenceMiddleware = async (req: any, res: Response, next: NextFunction) => {
	const { phone } = req.body;

	try {
		const userInstance = await AdminModel.findOne({ phone });
		if (!userInstance) {
			return res.status(404).json({
				message: "User does not exist"
			});
		}

		req.user = userInstance;
		next();
	} catch (err) {
		console.error("Error checking user existence:", err);
		return res.status(500).json({
			message: "Failed to check user existence",
			error: err
		});
	}
};

export const validateAdminRouteExistenceMiddleware = async (req: any, res: Response, next: NextFunction) => {
	const { phone } = req.query;

	try {
		const userInstance = await AdminModel.findOne({ phone });
		if (!userInstance) {
			return res.status(404).json({
				message: "User does not exist"
			});
		}

		req.user = userInstance;
		next();
	} catch (err) {
		console.error("Error checking user existence:", err);
		return res.status(500).json({
			message: "Failed to check user existence",
			error: err
		});
	}
};
