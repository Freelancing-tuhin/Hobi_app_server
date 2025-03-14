import express from "express";

import { validateAdminRouteExistenceMiddleware } from "../../../../middleware/validation/validateUserExistance.middleware";
import { createTransaction, getTransactions } from "../../controllers/transaction/transaction.controller";

const router = express.Router();

router.route("/create").post(createTransaction);

router.route("/get-all").get(getTransactions);

module.exports = router;
