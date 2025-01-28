import express from "express";
import { loginAdmin, loginProvider, loginUser, signUpAdmin, signUpProvider, signUpUser } from "../../controllers/auth/auth.controller";
import { hashPassword } from "../../../../middleware/auth/hashPassword.middleware";
import { checkAdminExistenceMiddleware, checkProviderExistenceMiddleware, checkUserExistenceMiddleware } from "../../../../middleware/validation/checkUserExistence.middleware";
import { validateAdminExistenceMiddleware, validateProviderExistenceMiddleware, validateUserExistenceMiddleware } from "../../../../middleware/validation/validateUserExistance.middleware";
import { verifyPasswordMiddleware } from "../../../../middleware/auth/verifyPassword.middleware";


const router = express.Router();


router.route("/user-signup").post( checkUserExistenceMiddleware, hashPassword, signUpUser);
router.route("/user-login").post(validateUserExistenceMiddleware, verifyPasswordMiddleware, loginUser);


router.route("/provider-signup").post( checkProviderExistenceMiddleware, hashPassword, signUpProvider);
router.route("/provider-login").post(validateProviderExistenceMiddleware, verifyPasswordMiddleware, loginProvider);


router.route("/admin-signup").post( checkAdminExistenceMiddleware, hashPassword, signUpAdmin);
router.route("/admin-login").post(validateAdminExistenceMiddleware, verifyPasswordMiddleware, loginAdmin);


module.exports = router;
