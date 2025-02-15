import express from "express";
import { updateOrganizerDetails, updateOrganizerDocuments } from "../../controllers/organizer/organizer.controller";
import { upload } from "../../../../middleware/multer.middleware";

const router = express.Router();

router.route("/update_profile").patch(updateOrganizerDetails);

router.route("/update_documents").patch(
	upload.fields([
		{ name: "licenses_for_establishment", maxCount: 1 },
		{ name: "certificate_of_incorporation", maxCount: 1 },
		{ name: "licenses_for_activity_undertaken", maxCount: 1 },
		{ name: "certifications", maxCount: 3 },
		{ name: "insurance_for_outdoor_activities", maxCount: 1 },
		{ name: "health_safety_documents", maxCount: 1 }
	]),
	updateOrganizerDocuments
);

module.exports = router;
