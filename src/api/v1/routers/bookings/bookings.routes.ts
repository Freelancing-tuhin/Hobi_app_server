import { Router } from "express";
import { createBooking, updateBooking } from "../../controllers/bookings/bookings.controller";

const router = Router();

router.post("/create-booking", createBooking);

router.patch("/confirm-booking", updateBooking);

// router.get("/get-user-bookings", getUserBookings);

// router.get("/get-event-bookings", getEventBookings);

// router.patch("/cancel-booking", cancelBooking);

module.exports = router;
