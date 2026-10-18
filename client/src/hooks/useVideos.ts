import { useCallback, useEffect, useRef, useState } from "react";
import { videoApi } from "../services/videoApi";
import type { SharePlatform, Video } from "../types/video";

const USER_ID_STORAGE_KEY = "socially-approved-carousel-user-id";

export interface UseVideosResult {
  videos: Video[];
  isLoading: boolean;
  error: Error | null;
  likedVideoIds: ReadonlySet<string>;
  pendingLikeIds: ReadonlySet<string>;
  likeErrors: Readonly<Record<string, string>>;
  likeVideo: (videoId: string) => Promise<void>;
  pendingShareIds: ReadonlySet<string>;
  shareErrors: Readonly<Record<string, string>>;
  shareVideo: (videoId: string, platform: SharePlatform) => Promise<void>;
}

function getUserId(): string {
  const savedUserId = window.localStorage.getItem(USER_ID_STORAGE_KEY);
  if (savedUserId) return savedUserId;

  const userId = window.crypto.randomUUID();
  window.localStorage.setItem(USER_ID_STORAGE_KEY, userId);
  return userId;
}

export function useVideos(): UseVideosResult {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [likedVideoIds, setLikedVideoIds] = useState<ReadonlySet<string>>(() => new Set());
  const [pendingLikeIds, setPendingLikeIds] = useState<ReadonlySet<string>>(() => new Set());
  const [likeErrors, setLikeErrors] = useState<Readonly<Record<string, string>>>({});
  const pendingLikeIdsRef = useRef(new Set<string>());
  const [pendingShareIds, setPendingShareIds] = useState<ReadonlySet<string>>(() => new Set());
  const [shareErrors, setShareErrors] = useState<Readonly<Record<string, string>>>({});
  const pendingShareIdsRef = useRef(new Set<string>());

  useEffect(() => {
    let isCurrent = true;

    videoApi
      .getVideos(getUserId())
      .then((responseVideos) => {
        if (isCurrent) {
          setVideos(responseVideos);
          setLikedVideoIds(new Set(
            responseVideos.filter((video) => video.liked).map((video) => video.id),
          ));
        }
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

  const likeVideo = useCallback(async (videoId: string) => {
    if (pendingLikeIdsRef.current.has(videoId) || likedVideoIds.has(videoId)) return;

    const video = videos.find((item) => item.id === videoId);
    if (!video) return;

    const previousLikes = video.likes;
    pendingLikeIdsRef.current.add(videoId);
    setPendingLikeIds(new Set(pendingLikeIdsRef.current));
    setLikeErrors((current) => {
      const next = { ...current };
      delete next[videoId];
      return next;
    });
    setLikedVideoIds((current) => new Set(current).add(videoId));
    setVideos((current) => current.map((item) => (
      item.id === videoId ? { ...item, likes: previousLikes + 1 } : item
    )));

    try {
      const result = await videoApi.likeVideo(videoId, getUserId());
      setVideos((current) => current.map((item) => (
        item.id === videoId ? { ...item, likes: result.likes } : item
      )));
      if (result.liked || result.duplicate) {
        setLikedVideoIds((current) => new Set(current).add(videoId));
      }
    } catch (likeError: unknown) {
      setLikedVideoIds((current) => {
        const next = new Set(current);
        next.delete(videoId);
        return next;
      });
      setVideos((current) => current.map((item) => (
        item.id === videoId ? { ...item, likes: previousLikes } : item
      )));
      setLikeErrors((current) => ({
        ...current,
        [videoId]: likeError instanceof Error
          ? likeError.message
          : "Your like could not be saved. Please try again.",
      }));
    } finally {
      pendingLikeIdsRef.current.delete(videoId);
      setPendingLikeIds(new Set(pendingLikeIdsRef.current));
    }
  }, [likedVideoIds, videos]);

  const shareVideo = useCallback(async (videoId: string, platform: SharePlatform) => {
    if (pendingShareIdsRef.current.has(videoId)) return;

    const video = videos.find((item) => item.id === videoId);
    if (!video) return;

    const previousShares = video.shares;
    pendingShareIdsRef.current.add(videoId);
    setPendingShareIds(new Set(pendingShareIdsRef.current));
    setShareErrors((current) => {
      const next = { ...current };
      delete next[videoId];
      return next;
    });
    setVideos((current) => current.map((item) => (
      item.id === videoId ? { ...item, shares: previousShares + 1 } : item
    )));

    try {
      const result = await videoApi.shareVideo(videoId, platform);
      setVideos((current) => current.map((item) => (
        item.id === videoId ? { ...item, shares: result.shares } : item
      )));
    } catch (shareError: unknown) {
      setVideos((current) => current.map((item) => (
        item.id === videoId ? { ...item, shares: previousShares } : item
      )));
      setShareErrors((current) => ({
        ...current,
        [videoId]: shareError instanceof Error
          ? shareError.message
          : "Your share could not be recorded.",
      }));
    } finally {
      pendingShareIdsRef.current.delete(videoId);
      setPendingShareIds(new Set(pendingShareIdsRef.current));
    }
  }, [videos]);

  return {
    videos,
    isLoading,
    error,
    likedVideoIds,
    pendingLikeIds,
    likeErrors,
    likeVideo,
    pendingShareIds,
    shareErrors,
    shareVideo,
  };
}
