import { SociallyApproved } from "./components/SociallyApproved/SociallyApproved";
import { VideoCard } from "./components/VideoCard/VideoCard";
import { LoadingSpinner } from "./components/LoadingSpinner/LoadingSpinner";
import { useVideos } from "./hooks/useVideos";

export function App() {
  const { videos, isLoading, error } = useVideos();

  return (
    <SociallyApproved>
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-violet-700">
          Socially Approved
        </p>
        <h1 className="mb-2 mt-1 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Video library
        </h1>
        <p className="max-w-2xl leading-relaxed text-slate-600">
          Starter screen for the video carousel. Full carousel interactions are not implemented yet.
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
        <section
          className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,250px),1fr))] gap-5"
          aria-label="Videos"
        >
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </section>
      )}
    </SociallyApproved>
  );
}
