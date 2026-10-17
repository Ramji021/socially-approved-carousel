import cors from "cors";
import express from "express";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { healthRouter } from "./routes/health.routes";
import { videosRouter } from "./routes/videos.routes";

export const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json({ limit: "16kb" }));

app.use(healthRouter);
app.use(videosRouter);
app.use("/api", healthRouter);
app.use("/api", videosRouter);
app.use(notFoundHandler);
app.use(errorHandler);
