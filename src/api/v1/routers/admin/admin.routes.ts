import express from "express";
import { deleteProvider, editProvider, getAllProviders } from "../../controllers/admin/admin.providers.controller";
import { validateAdminRouteExistenceMiddleware } from "../../../../middleware/validation/validateUserExistance.middleware";
import { checkUserExistenceMiddleware } from "../../../../middleware/validation/checkUserExistence.middleware";
import { hashPassword } from "../../../../middleware/auth/hashPassword.middleware";
import { signUpProvider } from "../../controllers/auth/auth.controller";

const router = express.Router();

router.route("/getAllProviders").get(validateAdminRouteExistenceMiddleware, getAllProviders);
router.route("/editProvider").patch(validateAdminRouteExistenceMiddleware, editProvider);
router.route("/deleteProvider").delete(validateAdminRouteExistenceMiddleware, deleteProvider);
router.route("/createProvider").post(checkUserExistenceMiddleware, hashPassword, signUpProvider);

module.exports = router;
