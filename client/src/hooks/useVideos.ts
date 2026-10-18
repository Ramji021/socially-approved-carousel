import { useEffect, useState } from "react";
import { videoApi } from "../services/videoApi";
import type { Video } from "../types/video";

export interface UseVideosResult {
  videos: Video[];
  isLoading: boolean;
  error: Error | null;
}

export function useVideos(): UseVideosResult {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isCurrent = true;

    videoApi
      .getVideos()
      .then(({ videos: responseVideos }) => {
        if (isCurrent) setVideos(responseVideos);
      })
      .catch((requestError: unknown) => {
        if (isCurrent) {
          setError(
            requestError instanceof Error
              ? requestError
              : new Error("Unable to load videos."),
          );
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  return { videos, isLoading, error };
}
