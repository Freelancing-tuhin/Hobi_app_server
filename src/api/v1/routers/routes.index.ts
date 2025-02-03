import express from "express";

const app = express();

app.use("/auth", require("./auth/auth.routes"));
app.use("/services", require("./services/service.routes"));
app.use("/admin", require("./admin/admin.routes"));
app.use("/reviews", require("./review/review.routes"));


module.exports = app;
