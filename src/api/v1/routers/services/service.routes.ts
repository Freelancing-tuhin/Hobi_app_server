import express from "express";
import {
	createService,
	deleteService,
	editService,
	getAllServices,
	getServiceById
} from "../../controllers/services/service.controller";
import { validateAdminRouteExistenceMiddleware } from "../../../../middleware/validation/validateUserExistance.middleware";

const router = express.Router();

router.route("/create").post(createService);

router.route("/edit").put(editService);

router.route("/delete").delete(deleteService);

router.route("/get").get(getServiceById);

router.route("/get-all").get(getAllServices);

module.exports = router;
