import express from "express";
import { updateOrganizerDetails } from "../../controllers/provider/provider.controller";

const router = express.Router();

router.route("/update_profile").patch(updateOrganizerDetails);

module.exports = router;
