import { Request, Response } from "express";
import EventModel from "../../../../models/event.model";
import { MESSAGE } from "../../../../constants/message";

// Helper to extract category name consistently
const extractCategoryName = (category: any): string => {
	if (!category) return "Unknown";
	if (typeof category === "string") return category.trim();
	if (typeof category === "object" && category.name) return category.name.trim();
	return "Unknown";
};

export const getAllCategoriesWithStats = async (req: Request, res: Response) => {
	try {
		// 1. Aggregate event counts per category
		const categoryEventCounts = await EventModel.aggregate([
			{
				$group: {
					_id: "$category",
					count: { $sum: 1 }
				}
			}
		]);

		// 2. Aggregate monthly stats per category
		const categoryMonthlyStats = await EventModel.aggregate([
			{
				$group: {
					_id: {
						category: "$category",
						month: { $month: "$createdAt" }
					},
					count: { $sum: 1 }
				}
			}
		]);

		// 3. Normalize and structure the result
		const categoriesWithStats: {
			categoryName: string;
			eventCount: number;
			categoryStats: number[];
		}[] = [];

		for (const cat of categoryEventCounts) {
			const categoryName = extractCategoryName(cat._id);
			const monthlyStats = Array(12).fill(0);

			categoryMonthlyStats.forEach((stat) => {
				const statCategory = extractCategoryName(stat._id.category);
				if (statCategory === categoryName) {
					monthlyStats[stat._id.month - 1] = stat.count;
				}
			});

			categoriesWithStats.push({
				categoryName,
				eventCount: cat.count,
				categoryStats: monthlyStats
			});
		}

		return res.status(200).json({
			message: MESSAGE.get.succ,
			result: categoriesWithStats
		});
	} catch (error) {
		console.error(error);
		return res.status(400).json({
			message: MESSAGE.get.fail,
			error
		});
	}
};
