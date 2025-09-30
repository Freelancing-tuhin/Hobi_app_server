import express from "express";
import {
	loginAdmin,
	loginOrganizer,
	loginUser,
	signUpAdmin,
	signUpOrganizer,
	signUpUser
} from "../../controllers/auth/auth.controller";
import { hashPassword } from "../../../../middleware/auth/hashPassword.middleware";
import {
	checkAdminExistenceMiddleware,
	checkProviderExistenceMiddleware,
	checkUserExistenceMiddleware
} from "../../../../middleware/validation/checkUserExistence.middleware";
import {
	validateAdminExistenceMiddleware,
	validateProviderExistenceMiddleware,
	validateUserExistenceMiddleware
} from "../../../../middleware/validation/validateUserExistance.middleware";
import { getOtp } from "../../controllers/auth/otp.controller";

const router = express.Router();

router.route("/get-otp").post(getOtp);

router.route("/user-signup").post(checkUserExistenceMiddleware, signUpUser);
router.route("/user-login").post(validateUserExistenceMiddleware, loginUser);

router.route("/organizer-signup").post(checkProviderExistenceMiddleware, signUpOrganizer);
router.route("/organizer-login").post(validateProviderExistenceMiddleware, loginOrganizer);

router.route("/admin-signup").post(checkAdminExistenceMiddleware, signUpAdmin);
router.route("/admin-login").post(validateAdminExistenceMiddleware, loginAdmin);

module.exports = router;
