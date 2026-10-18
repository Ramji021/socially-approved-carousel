import type { SharePlatform, Video } from "../types/video";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000").replace(
  /\/+$/,
  "",
);
const sharePlatforms = new Set<string>([
  "copy",
  "web-share",
  "whatsapp",
  "facebook",
  "twitter",
]);

export class VideoApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = "VideoApiError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSharePlatform(value: unknown): value is SharePlatform {
  return typeof value === "string" && sharePlatforms.has(value);
}

function isVideo(value: unknown): value is Video {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    typeof value.videoUrl === "string" &&
    typeof value.thumbnailUrl === "string" &&
    typeof value.likes === "number" &&
    Number.isFinite(value.likes) &&
    typeof value.shares === "number" &&
    Number.isFinite(value.shares) &&
    typeof value.duration === "number" &&
    Number.isFinite(value.duration) &&
    typeof value.liked === "boolean"
  );
}

function isVideosResponse(value: unknown): value is { videos: Video[] } {
  return isRecord(value) && Array.isArray(value.videos) && value.videos.every(isVideo);
}

function getApiError(payload: unknown, fallback: string, status: number): VideoApiError {
  const error = isRecord(payload) && isRecord(payload.error) ? payload.error : undefined;
  return new VideoApiError(
    typeof error?.message === "string" ? error.message : fallback,
    status,
    typeof error?.code === "string" ? error.code : "REQUEST_FAILED",
  );
}

async function getVideos(userId: string): Promise<Video[]> {
  let response: Response;
  try {
    const query = new URLSearchParams({ userId });
    response = await fetch(`${apiBaseUrl}/videos?${query.toString()}`);
  } catch {
    throw new VideoApiError(
      "Unable to connect to the video server. Check that the backend is running.",
      0,
      "NETWORK_ERROR",
    );
  }

  let payload: unknown;
  try {
    payload = (await response.json()) as unknown;
  } catch {
    throw new VideoApiError(
      "The video server returned an empty or invalid JSON response.",
      response.status,
      "INVALID_RESPONSE",
    );
  }

  if (!response.ok) {
    throw getApiError(payload, "The video request failed.", response.status);
  }

  if (!isVideosResponse(payload)) {
    throw new VideoApiError(
      "The video server response has an invalid format.",
      response.status,
      "INVALID_RESPONSE",
    );
  }

  return payload.videos;
}

export interface LikeVideoResult {
  likes: number;
  liked: boolean;
  duplicate: boolean;
}

async function likeVideo(videoId: string, userId: string): Promise<LikeVideoResult> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId, userId }),
    });
  } catch {
    throw new VideoApiError(
      "Unable to connect to the video server. Your like was not saved.",
      0,
      "NETWORK_ERROR",
    );
  }

  let payload: unknown;
  try {
    payload = (await response.json()) as unknown;
  } catch {
    throw new VideoApiError(
      "The video server returned an empty or invalid like response.",
      response.status,
      "INVALID_RESPONSE",
    );
  }

  if (!response.ok) {
    throw getApiError(payload, "The like request failed.", response.status);
  }

  if (
    !isRecord(payload) ||
    typeof payload.likes !== "number" ||
    !Number.isFinite(payload.likes) ||
    payload.likes < 0 ||
    payload.liked !== true ||
    typeof payload.duplicate !== "boolean"
  ) {
    throw new VideoApiError(
      "The video server returned an invalid like response.",
      response.status,
      "INVALID_RESPONSE",
    );
  }

  return {
    likes: payload.likes,
    liked: payload.liked,
    duplicate: payload.duplicate,
  };
}

export interface ShareVideoResult {
  videoId: string;
  shares: number;
  platform: SharePlatform;
}

async function shareVideo(
  videoId: string,
  platform: SharePlatform,
): Promise<ShareVideoResult> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId, platform }),
    });
  } catch {
    throw new VideoApiError(
      "Unable to connect to the video server. Your share was not recorded.",
      0,
      "NETWORK_ERROR",
    );
  }

  let payload: unknown;
  try {
    payload = (await response.json()) as unknown;
  } catch {
    throw new VideoApiError(
      "The video server returned an empty or invalid share response.",
      response.status,
      "INVALID_RESPONSE",
    );
  }

  if (!response.ok) {
    throw getApiError(payload, "The share request failed.", response.status);
  }

  if (
    !isRecord(payload) ||
    payload.videoId !== videoId ||
    typeof payload.shares !== "number" ||
    !Number.isFinite(payload.shares) ||
    payload.shares < 0 ||
    !isSharePlatform(payload.platform) ||
    payload.platform !== platform
  ) {
    throw new VideoApiError(
      "The video server returned an invalid share response.",
      response.status,
      "INVALID_RESPONSE",
    );
  }

  return {
    videoId: payload.videoId,
    shares: payload.shares,
    platform: payload.platform,
  };
}

export const videoApi = {
  getVideos,
  likeVideo,
  shareVideo,
};
