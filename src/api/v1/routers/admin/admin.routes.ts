import express from "express";
import {
	deleteProvider,
	editOrganizers,
	getAllOrganizers,
	getOrganizerById
} from "../../controllers/admin/admin.organizer.controller";
import { validateAdminRouteExistenceMiddleware } from "../../../../middleware/validation/validateUserExistance.middleware";
import { checkUserExistenceMiddleware } from "../../../../middleware/validation/checkUserExistence.middleware";
import { hashPassword } from "../../../../middleware/auth/hashPassword.middleware";
import { signUpOrganizer } from "../../controllers/auth/auth.controller";
import { eventStats } from "../../controllers/admin/admin.event.controller";
import { dashBoardStats } from "../../controllers/admin/adminDashboard.controller";
import { getUsersWithBookings } from "../../controllers/admin/admin.users.controller";
import { getAllCategoriesWithStats } from "../../controllers/admin/admin.category.controller";

const router = express.Router();

router.route("/getAllOrganizers").get(getAllOrganizers);

router.route("/getAllUsers").get(getUsersWithBookings);

router.route("/getOrganizerById").get(getOrganizerById);

router.route("/editOrganizers").patch(editOrganizers);

router.route("/deleteProvider").delete(validateAdminRouteExistenceMiddleware, deleteProvider);

router.route("/createProvider").post(checkUserExistenceMiddleware, hashPassword, signUpOrganizer);

router.route("/view-event-admin").get(eventStats);

router.route("/dashboard-stats").get(dashBoardStats);

router.route("/dashboard-category").get(getAllCategoriesWithStats);

module.exports = router;
