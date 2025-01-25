import express from "express";
import { loginProvider, loginUser, signUpProvider, signUpUser } from "../../controllers/auth/auth.controller";
import { hashPassword } from "../../../../middleware/auth/hashPassword.middleware";
import { checkProviderExistenceMiddleware, checkUserExistenceMiddleware } from "../../../../middleware/validation/checkUserExistence.middleware";
import { validateProviderExistenceMiddleware, validateUserExistenceMiddleware } from "../../../../middleware/validation/validateUserExistance.middleware";
import { verifyPasswordMiddleware } from "../../../../middleware/auth/verifyPassword.middleware";


const router = express.Router();


router.route("/user-signup").post( checkUserExistenceMiddleware, hashPassword, signUpUser);
router.route("/user-login").post(validateUserExistenceMiddleware, verifyPasswordMiddleware, loginUser);


router.route("/provider-signup").post( checkProviderExistenceMiddleware, hashPassword, signUpProvider);
router.route("/provider-login").post(validateProviderExistenceMiddleware, verifyPasswordMiddleware, loginProvider);

module.exports = router;
