import * as bodyParser from "body-parser";
import * as dotenv from 'dotenv';
import * as express from "express";
import userRoutes from "./module/User/user.routes";

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use("/api", userRoutes);

export default app;