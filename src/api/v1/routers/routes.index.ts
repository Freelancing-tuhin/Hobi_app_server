import express from "express";

const app = express();

app.use("/auth", require("./auth/auth.routes"));
app.use("/admin", require("./admin/admin.routes"));
app.use("/reviews", require("./review/review.routes"));
app.use("/organizer", require("./organizer/organizer.routes"));
app.use("/payment", require("./payment/payment.routes"));
app.use("/services", require("./services/service.routes"));
app.use("/events", require("./event/event.routes"));

module.exports = app;
