import videoData from "../data/videos.json";
import type { Video } from "../types/video";

const videos = new Map<string, Video>(
  (videoData as Video[]).map((video) => [video.id, { ...video }]),
);
const likedUsers = new Map<string, Set<string>>(
  (videoData as Video[]).map((video) => [video.id, new Set<string>()]),
);

export const videoRepository = {
  getAll(userId?: string): Array<Video & { liked: boolean }> {
    return Array.from(videos.values(), (video) => ({
      ...video,
      liked: userId ? likedUsers.get(video.id)?.has(userId) ?? false : false,
    }));
  },

  addLike(videoId: string, userId: string): { video: Video; duplicate: boolean } | undefined {
    const video = videos.get(videoId);
    const users = likedUsers.get(videoId);
    if (!video || !users) return undefined;

    if (users.has(userId)) {
      return { video: { ...video }, duplicate: true };
    }

    users.add(userId);
    video.likes += 1;
    return { video: { ...video }, duplicate: false };
  },

  addShare(videoId: string): Video | undefined {
    const video = videos.get(videoId);
    if (!video) return undefined;

    video.shares += 1;
    return { ...video };
  },
};
