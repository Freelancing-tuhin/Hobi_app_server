import express from "express";
import { updateOrganizerDetails, updateOrganizerDocuments } from "../../controllers/provider/provider.controller";
import { upload } from "../../../../middleware/multer.middleware";

const router = express.Router();

router.route("/update_profile").patch(updateOrganizerDetails);

router
	.route("/update_documents")
	.patch(upload.fields([{ name: "licenses_for_establishment", maxCount: 1 }]), updateOrganizerDocuments);

module.exports = router;
