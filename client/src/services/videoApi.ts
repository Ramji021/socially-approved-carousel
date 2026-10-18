import type { ApiErrorResponse, VideosResponse } from "../types/api";
import type {
  LikeVideoInput,
  LikeVideoResponse,
  ShareVideoInput,
  ShareVideoResponse,
} from "../types/video";

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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let errorPayload: ApiErrorResponse | undefined;
    try {
      errorPayload = (await response.json()) as ApiErrorResponse;
    } catch {
      throw new VideoApiError("The video service returned an unreadable error.", response.status, "INVALID_ERROR_RESPONSE");
    }

    throw new VideoApiError(
      errorPayload.error?.message ?? "The video request failed.",
      response.status,
      errorPayload.error?.code ?? "REQUEST_FAILED",
    );
  }

  return (await response.json()) as T;
}

export const videoApi = {
  getVideos(): Promise<VideosResponse> {
    return request<VideosResponse>("/videos");
  },

  likeVideo(input: LikeVideoInput): Promise<LikeVideoResponse> {
    return request<LikeVideoResponse>("/like", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  shareVideo(input: ShareVideoInput): Promise<ShareVideoResponse> {
    return request<ShareVideoResponse>("/share", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
