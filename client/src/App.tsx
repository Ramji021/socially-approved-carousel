import { useCallback, useMemo, useState } from "react";
import { SociallyApproved } from "./components/SociallyApproved/SociallyApproved";
import { VideoCarousel } from "./components/SociallyApproved/VideoCarousel";
import { LoadingSpinner } from "./components/LoadingSpinner/LoadingSpinner";
import { VideoModal } from "./components/VideoModal/VideoModal";
import { useVideos } from "./hooks/useVideos";
import type { Video } from "./types/video";

const MAX_CAROUSEL_VIDEOS = 24;

export function App() {
  const { videos, isLoading, error } = useVideos();
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

  return (
    <SociallyApproved>
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-violet-700">
          Socially Approved
        </p>
        <h1 className="mb-2 mt-1 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Socially Approved
        </h1>
        <p className="max-w-2xl leading-relaxed text-slate-600">
          Discover videos people are enjoying.
        </p>
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
          onSelect={openVideo}
        />
      )}

      <VideoModal
        isOpen={selectedIndex !== null}
        videos={carouselVideos}
        activeIndex={selectedIndex ?? 0}
        onActiveIndexChange={setSelectedIndex}
        onClose={closeVideo}
      />
    </SociallyApproved>
  );
}
