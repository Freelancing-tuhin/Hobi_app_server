import express from "express";
import { loginUser, signUpUser } from "../../controllers/auth/auth.controller";
import { hashPassword } from "../../../../middleware/auth/hashPassword.middleware";
import { checkUserExistenceMiddleware } from "../../../../middleware/validation/checkUserExistence.middleware";
import { validateUserExistenceMiddleware } from "../../../../middleware/validation/validateUserExistance.middleware";
import { verifyPasswordMiddleware } from "../../../../middleware/auth/verifyPassword.middleware";


const router = express.Router();


router.route("/signup").post( checkUserExistenceMiddleware, hashPassword, signUpUser);
router.route("/login").post(validateUserExistenceMiddleware, verifyPasswordMiddleware, loginUser);

module.exports = router;
