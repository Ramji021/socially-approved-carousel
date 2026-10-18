import type { Video } from "./video";

export interface VideosResponse {
  videos: Video[];
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
