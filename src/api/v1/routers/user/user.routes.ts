import express from "express";
import {
	getUserDetails,
	getUserWithBookings,
	getUserBookings,
	updateUserDetails,
	updateUserPassword,
	deleteUserAccount
} from "../../controllers/user/user.controller";
import { jwtAuthMiddleware } from "../../../../middleware/auth/jwtAuth.middleware";

const router = express.Router();

// Protected routes - require JWT authentication

// Get user profile details (from JWT token)
router.get("/details", jwtAuthMiddleware, getUserDetails);

// Get user profile with all bookings
router.get("/profile-with-bookings", getUserWithBookings);

// Get user's bookings only (with pagination and optional status filter)
router.get("/bookings", jwtAuthMiddleware, getUserBookings);

// Update user profile details
router.patch("/update-profile", updateUserDetails);

// Update user password
router.patch("/update-password", jwtAuthMiddleware, updateUserPassword);

// Delete user account
router.delete("/delete-account", jwtAuthMiddleware, deleteUserAccount);

module.exports = router;
