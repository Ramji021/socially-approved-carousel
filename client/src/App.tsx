import { SociallyApproved } from "./components/SociallyApproved/SociallyApproved";
import { VideoCard } from "./components/VideoCard/VideoCard";
import { LoadingSpinner } from "./components/LoadingSpinner/LoadingSpinner";
import { useVideos } from "./hooks/useVideos";
import "./App.css";

export function App() {
  const { videos, isLoading, error } = useVideos();

  return (
    <SociallyApproved>
      <header className="page-header">
        <p className="eyebrow">Socially Approved</p>
        <h1>Video library</h1>
        <p>Starter screen for the video carousel. Full carousel interactions are not implemented yet.</p>
      </header>

      {isLoading && <LoadingSpinner label="Loading videos..." />}
      {error && <p className="error-message" role="alert">{error.message}</p>}
      {!isLoading && !error && videos.length === 0 && <p>No videos are available.</p>}

      {!isLoading && !error && videos.length > 0 && (
        <section className="video-grid" aria-label="Videos">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </section>
      )}
    </SociallyApproved>
  );
}
