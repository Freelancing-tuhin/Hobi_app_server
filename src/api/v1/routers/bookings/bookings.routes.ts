import { Router } from "express";
import { createBooking } from "../../controllers/bookings/bookings.controller";

const router = Router();

router.post("/create-booking", createBooking);

// router.get("/get-user-bookings", getUserBookings);

// router.get("/get-event-bookings", getEventBookings);

// router.patch("/cancel-booking", cancelBooking);

module.exports = router;
