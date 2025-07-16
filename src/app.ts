// Express app setup
import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "path";
import errorHandler from "./middlewares/error.middleware";
import routes from "./routes";
const rootPath = path.resolve(__dirname, "../..");
const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/public", express.static(path.join(rootPath, "uploads")));
app.use("/api", routes);
app.use(errorHandler);

export default app;
