import type { NextFunction, Request, Response } from "express";
import { videoService } from "../services/video.service";
import type { SharePlatform } from "../types/video";

const sharePlatforms = new Set<string>(["copy", "web-share", "whatsapp", "facebook", "twitter"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isSharePlatform(value: unknown): value is SharePlatform {
  return typeof value === "string" && sharePlatforms.has(value);
}

function invalidBody(response: Response, message: string): void {
  response.status(400).json({
    error: {
      code: "VALIDATION_ERROR",
      message,
    },
  });
}

export const videoController = {
  getVideos(_request: Request, response: Response, next: NextFunction): void {
    try {
      response.status(200).json({ videos: videoService.getVideos() });
    } catch (error) {
      next(error);
    }
  },

  likeVideo(request: Request, response: Response, next: NextFunction): void {
    try {
      if (!isRecord(request.body)) {
        invalidBody(response, "Request body must be a JSON object.");
        return;
      }

      const { videoId, userId } = request.body;
      if (!isNonEmptyString(videoId) || !isNonEmptyString(userId)) {
        invalidBody(response, "videoId and userId must be non-empty strings.");
        return;
      }

      const result = videoService.likeVideo(videoId.trim(), userId.trim());
      response.status(200).json({
        video: result.video,
        likes: result.video.likes,
        liked: true,
        duplicate: result.duplicate,
      });
    } catch (error) {
      next(error);
    }
  },

  shareVideo(request: Request, response: Response, next: NextFunction): void {
    try {
      if (!isRecord(request.body)) {
        invalidBody(response, "Request body must be a JSON object.");
        return;
      }

      const { videoId, platform } = request.body;
      if (!isNonEmptyString(videoId)) {
        invalidBody(response, "videoId must be a non-empty string.");
        return;
      }
      if (!isSharePlatform(platform)) {
        invalidBody(response, "platform must be one of: copy, web-share, whatsapp, facebook, twitter.");
        return;
      }

      const video = videoService.shareVideo(videoId.trim());
      response.status(200).json({
        videoId: video.id,
        shares: video.shares,
        platform,
      });
    } catch (error) {
      next(error);
    }
  },
};
