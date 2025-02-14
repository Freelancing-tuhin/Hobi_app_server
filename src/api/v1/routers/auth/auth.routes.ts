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
import { verifyPasswordMiddleware } from "../../../../middleware/auth/verifyPassword.middleware";

const router = express.Router();

router.route("/user-signup").post(checkUserExistenceMiddleware, hashPassword, signUpUser);
router.route("/user-login").post(validateUserExistenceMiddleware, verifyPasswordMiddleware, loginUser);

router.route("/organizer-signup").post(checkProviderExistenceMiddleware, hashPassword, signUpOrganizer);
router.route("/organizer-login").post(validateProviderExistenceMiddleware, verifyPasswordMiddleware, loginOrganizer);

router.route("/admin-signup").post(checkAdminExistenceMiddleware, hashPassword, signUpAdmin);
router.route("/admin-login").post(validateAdminExistenceMiddleware, verifyPasswordMiddleware, loginAdmin);

module.exports = router;
