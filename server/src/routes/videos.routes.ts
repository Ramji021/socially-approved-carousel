import { Router } from "express";
import { videoController } from "../controllers/video.controller";

export const videosRouter = Router();

videosRouter.get("/videos", videoController.getVideos);
videosRouter.post("/like", videoController.likeVideo);
videosRouter.post("/share", videoController.shareVideo);
