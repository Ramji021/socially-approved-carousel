import type { Video } from "../types/video";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000").replace(
  /\/+$/,
  "",
);

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
    Number.isFinite(value.duration)
  );
}

function isVideosResponse(value: unknown): value is { videos: Video[] } {
  return isRecord(value) && Array.isArray(value.videos) && value.videos.every(isVideo);
}

async function getVideos(): Promise<Video[]> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/videos`);
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
    const error = isRecord(payload) && isRecord(payload.error) ? payload.error : undefined;
    throw new VideoApiError(
      typeof error?.message === "string" ? error.message : "The video request failed.",
      response.status,
      typeof error?.code === "string" ? error.code : "REQUEST_FAILED",
    );
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

export const videoApi = {
  getVideos,
};
