import { Router } from "express";
import { createEvent } from "../../controllers/event/event.controller";
import { upload } from "../../../../middleware/multer.middleware";

const router = Router();

router.route("/create-event").post(upload.fields([{ name: "banner_Image", maxCount: 1 }]), createEvent);

module.exports = router;
