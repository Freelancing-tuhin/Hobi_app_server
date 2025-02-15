import express from "express";
import { deleteProvider, editOrganizers, getAllOrganizers } from "../../controllers/admin/admin.organizer.controller";
import { validateAdminRouteExistenceMiddleware } from "../../../../middleware/validation/validateUserExistance.middleware";
import { checkUserExistenceMiddleware } from "../../../../middleware/validation/checkUserExistence.middleware";
import { hashPassword } from "../../../../middleware/auth/hashPassword.middleware";
import { signUpOrganizer } from "../../controllers/auth/auth.controller";

const router = express.Router();

router.route("/getAllOrganizers").get(getAllOrganizers);
router.route("/editOrganizers").patch(editOrganizers);
router.route("/deleteProvider").delete(validateAdminRouteExistenceMiddleware, deleteProvider);
router.route("/createProvider").post(checkUserExistenceMiddleware, hashPassword, signUpOrganizer);

module.exports = router;
