import { Router } from "express";
import {
	createEvent,
	editEvent,
	getFilteredEvents,
	getUpcomingEvents,
	updateEventBanner
} from "../../controllers/event/event.controller";
import { upload } from "../../../../middleware/multer.middleware";

const router = Router();

router.route("/create-event").post(upload.fields([{ name: "banner_Image", maxCount: 1 }]), createEvent);

router.patch("/edit-event", editEvent);

router.patch("/update-event-banner", upload.fields([{ name: "banner_Image", maxCount: 1 }]), updateEventBanner);

router.get("/get-events", getFilteredEvents);

router.get("/get-upcoming--events", getUpcomingEvents);

module.exports = router;
