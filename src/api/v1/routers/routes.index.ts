import express from "express";

const app = express();

app.use("/auth", require("./auth/auth.routes"));
app.use("/admin", require("./admin/admin.routes"));
app.use("/reviews", require("./review/review.routes"));
app.use("/organizer", require("./organizer/organizer.routes"));
app.use("/payment", require("./payment/payment.routes"));
app.use("/services", require("./services/service.routes"));
app.use("/events", require("./event/event.routes"));
app.use("/bookings", require("./bookings/bookings.routes"));
app.use("/notifications", require("./notification/notification.routes"));
app.use("/transaction", require("./transaction/transaction.routes"));
app.use("/user", require("./user/user.routes"));

module.exports = app;
