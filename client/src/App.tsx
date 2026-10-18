import { useCallback, useMemo, useState } from "react";
import { SociallyApproved } from "./components/SociallyApproved/SociallyApproved";
import { VideoCarousel } from "./components/SociallyApproved/VideoCarousel";
import { LoadingSpinner } from "./components/LoadingSpinner/LoadingSpinner";
import { VideoModal } from "./components/VideoModal/VideoModal";
import { useVideos } from "./hooks/useVideos";
import type { SharePlatform, Video } from "./types/video";

const MAX_CAROUSEL_VIDEOS = 24;

export function App() {
  const {
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
  } = useVideos();
  const carouselVideos = useMemo(
    () => videos.slice(0, MAX_CAROUSEL_VIDEOS),
    [videos],
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const openVideo = useCallback((video: Video) => {
    const index = carouselVideos.findIndex((item) => item.id === video.id);
    if (index !== -1) setSelectedIndex(index);
  }, [carouselVideos]);
  const closeVideo = useCallback(() => {
    setSelectedIndex(null);
  }, []);
  const handleLike = useCallback((videoId: string) => {
    void likeVideo(videoId);
  }, [likeVideo]);
  const handleShare = useCallback((videoId: string, platform: SharePlatform) => (
    shareVideo(videoId, platform)
  ), [shareVideo]);

  return (
    <SociallyApproved>
      <section aria-labelledby="bestsellers-heading">
        <header className="mb-6">
          <h1
            id="bestsellers-heading"
            className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl"
          >
            Our Bestsellers
          </h1>
        </header>

        {isLoading && <LoadingSpinner label="Loading videos..." />}
        {error && (
          <p className="text-red-700" role="alert">
            {error.message}
          </p>
        )}
        {!isLoading && !error && videos.length === 0 && (
          <p className="text-slate-600">No videos are available.</p>
        )}

        {!isLoading && !error && videos.length > 0 && (
          <VideoCarousel
            videos={carouselVideos}
            likedVideoIds={likedVideoIds}
            pendingLikeIds={pendingLikeIds}
            likeErrors={likeErrors}
            onLike={handleLike}
            pendingShareIds={pendingShareIds}
            shareErrors={shareErrors}
            onShare={handleShare}
            onSelect={openVideo}
          />
        )}
      </section>

      <VideoModal
        isOpen={selectedIndex !== null}
        videos={carouselVideos}
        activeIndex={selectedIndex ?? 0}
        likedVideoIds={likedVideoIds}
        pendingLikeIds={pendingLikeIds}
        likeErrors={likeErrors}
        onLike={handleLike}
        pendingShareIds={pendingShareIds}
        shareErrors={shareErrors}
        onShare={handleShare}
        onActiveIndexChange={setSelectedIndex}
        onClose={closeVideo}
      />
    </SociallyApproved>
  );
}
