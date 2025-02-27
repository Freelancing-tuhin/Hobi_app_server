import express from "express";
import {
	createReview,
	editReview,
	getAllReviews,
	getReviewsByFilter
} from "../../controllers/review/review.controller";
import { jwtAuthMiddleware } from "../../../../middleware/auth/jwtAuth.middleware";

const router = express.Router();

router.route("/create").post(createReview);
router.route("/edit/:id").put(jwtAuthMiddleware, editReview);
router.route("/getAll").get(jwtAuthMiddleware, getAllReviews);
router.route("/filter").get(getReviewsByFilter);

module.exports = router;
