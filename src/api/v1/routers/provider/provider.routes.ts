import express from "express";
import { updatePastExperience } from "../../controllers/provider/provider.controller";

const router = express.Router();

router.route("/add-exp").patch(updatePastExperience);

module.exports = router;
