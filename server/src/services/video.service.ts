import { videoRepository } from "../repositories/video.repository";
import { ApiError } from "../types/api-error";
import type { Video } from "../types/video";

export const videoService = {
  getVideos(): Video[] {
    return videoRepository.getAll();
  },

  likeVideo(videoId: string, userId: string): { video: Video; duplicate: boolean } {
    const result = videoRepository.addLike(videoId, userId);
    if (!result) {
      throw new ApiError(404, "VIDEO_NOT_FOUND", `Video '${videoId}' was not found.`);
    }
    return result;
  },

  shareVideo(videoId: string): Video {
    const video = videoRepository.addShare(videoId);
    if (!video) {
      throw new ApiError(404, "VIDEO_NOT_FOUND", `Video '${videoId}' was not found.`);
    }
    return video;
  },
};
