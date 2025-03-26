import { Router } from "express";
import {
	createBooking,
	getOrganizerBookings,
	updateBooking,
	updateBookingStatus
} from "../../controllers/bookings/bookings.controller";

const router = Router();

router.post("/create-booking", createBooking);

router.patch("/confirm-booking", updateBooking);

router.patch("/update-status-booking", updateBookingStatus);

router.get("/get-organizer-booking", getOrganizerBookings);

// router.get("/get-user-bookings", getUserBookings);

// router.get("/get-event-bookings", getEventBookings);

// router.patch("/cancel-booking", cancelBooking);

module.exports = router;
