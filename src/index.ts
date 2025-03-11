/* eslint-disable quotes */
import express from "express";
import cors from "cors";
import bodyParser, { json } from "body-parser";
import connectDb from "./config/db.config";

// dotenv.config();
const app = express();

const port = process.env.PORT || 8989;

const options: cors.CorsOptions = {
	allowedHeaders: ["sessionId", "Content-Type"],
	exposedHeaders: ["sessionId"],
	origin: "*",
	methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
	preflightContinue: false
};

app.use(cors(options));
app.use(json());

app.use(express.json());
app.use(bodyParser.json());
app.get("/", (req, res) => {
	res.send(`<h1>Hobi Server running successfully</h1>`);
});

app.use("/api/v1", require("./api/v1/routers/routes.index"));

connectDb();

app.listen(port, () => {
	console.log(`🚀 Server is running at http://localhost:${port}`);
});
