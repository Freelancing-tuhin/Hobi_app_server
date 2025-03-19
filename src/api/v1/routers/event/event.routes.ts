import { Router } from "express";
import {
	createEvent,
	deleteEvent,
	editEvent,
	getFilteredEvents,
	getUpcomingEvents,
	updateEventBanner
} from "../../controllers/event/event.controller";
import { upload } from "../../../../middleware/multer.middleware";
import { getEventByIdFOrUsers } from "../../controllers/event/public.event.controller";
import {
	getBookingPerformance,
	getBookingStatistics,
	getBookingsByEvent
} from "../../controllers/event/organizer.event.controller";

const router = Router();

router.route("/create-event").post(upload.fields([{ name: "banner_Image", maxCount: 1 }]), createEvent);

router.patch("/edit-event", editEvent);

router.patch("/update-event-banner", upload.fields([{ name: "banner_Image", maxCount: 1 }]), updateEventBanner);

router.get("/get-events", getFilteredEvents);

router.get("/get-upcoming-events", getUpcomingEvents);

router.get("/view-event-stats", getBookingStatistics);

router.get("/view-event-users", getBookingsByEvent);

router.get("/view-event-performance", getBookingPerformance);

router.get("/delete-event", deleteEvent);

// PUBLIC ROUTES

router.get("/view-event-for-users", getEventByIdFOrUsers);

module.exports = router;
