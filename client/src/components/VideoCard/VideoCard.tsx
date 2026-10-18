import type { Video } from "../../types/video";

export interface VideoCardProps {
  video: Video;
  onSelect?: (video: Video) => void;
}

export function VideoCard({ video, onSelect }: VideoCardProps) {
  return (
    <article className="video-card">
      {onSelect ? (
        <button className="video-card__select" type="button" onClick={() => onSelect(video)}>
          <img src={video.thumbnailUrl} alt="" loading="lazy" />
          <h2>{video.title}</h2>
        </button>
      ) : (
        <>
          <img src={video.thumbnailUrl} alt="" loading="lazy" />
          <h2>{video.title}</h2>
        </>
      )}
      <p>{video.description}</p>
      <p className="video-card__stats">
        {video.likes.toLocaleString()} likes · {video.shares.toLocaleString()} shares
      </p>
    </article>
  );
}
