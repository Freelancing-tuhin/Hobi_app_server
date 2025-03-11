import { Router } from "express";
import { getNotificationsByReceiver } from "../../../../types/interface/notifications";

const router = Router();

router.get("/get_notification", getNotificationsByReceiver);

module.exports = router;
