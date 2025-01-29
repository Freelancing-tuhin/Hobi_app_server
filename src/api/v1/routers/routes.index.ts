import express from "express";

const app = express();

app.use("/auth", require("./auth/auth.routes"));
app.use("/services", require("./services/service.routes"));
app.use("/admin", require("./admin/admin.routes"));


module.exports = app;
