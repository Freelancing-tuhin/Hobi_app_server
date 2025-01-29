import express from "express";
import { deleteProvider, editProvider, getAllProviders } from "../../controllers/admin/admin.providers.controller";
import { validateAdminRouteExistenceMiddleware } from "../../../../middleware/validation/validateUserExistance.middleware";
import { createService, deleteService, editService } from "../../controllers/services/service.controller";
import { getAllServices } from "../../controllers/admin/admin.services.controller";
import { checkUserExistenceMiddleware } from "../../../../middleware/validation/checkUserExistence.middleware";
import { hashPassword } from "../../../../middleware/auth/hashPassword.middleware";
import { signUpProvider } from "../../controllers/auth/auth.controller";

const router = express.Router();

router.route("/getAllProviders").get(validateAdminRouteExistenceMiddleware,getAllProviders);
router.route("/editProvider").patch(validateAdminRouteExistenceMiddleware,editProvider);
router.route("/deleteProvider").delete(validateAdminRouteExistenceMiddleware,deleteProvider);
router.route("/createProvider").post(checkUserExistenceMiddleware,hashPassword,signUpProvider);


router.route("/getAllServices").get(validateAdminRouteExistenceMiddleware,getAllServices);
router.route("/createService").post(validateAdminRouteExistenceMiddleware,createService);
router.route("/editService").patch(validateAdminRouteExistenceMiddleware,editService);
router.route("/deleteService").delete(validateAdminRouteExistenceMiddleware,deleteService);



module.exports = router;
