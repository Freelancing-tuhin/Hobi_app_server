import express from "express";

const app = express();

app.use("/auth", require("./auth/auth.routes"));
app.use("/services", require("./services/service.routes"));
app.use("/admin", require("./admin/admin.routes"));
app.use("/reviews", require("./review/review.routes"));
app.use("/wallet", require("./wallet/wallet.routes"));
app.use("/service_call", require("./call/call.routes"));
// app.use("/provider", require("./"));

module.exports = app;
