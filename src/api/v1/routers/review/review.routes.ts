import express from "express";
import {
	createReview,
	deleteReview,
	editReview,
	getAllReviews,
	getReviewsByFilter,
	updateReviewStatusToAdmin
} from "../../controllers/review/review.controller";
import { jwtAuthMiddleware } from "../../../../middleware/auth/jwtAuth.middleware";

const router = express.Router();

router.route("/create").post(createReview);

router.route("/edit/:id").put(editReview);

router.route("/report_review").patch(updateReviewStatusToAdmin);

router.route("/getAll").get(jwtAuthMiddleware, getAllReviews);

router.route("/filter").get(getReviewsByFilter);

router.route("/delete").delete(deleteReview);

module.exports = router;
