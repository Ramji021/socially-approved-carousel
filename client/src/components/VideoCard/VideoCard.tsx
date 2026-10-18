import type { Video } from "../../types/video";

export interface VideoCardProps {
  video: Video;
  onSelect?: (video: Video) => void;
}

export function VideoCard({ video, onSelect }: VideoCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {onSelect ? (
        <button
          className="block w-full bg-transparent p-0 text-left text-inherit"
          type="button"
          onClick={() => onSelect(video)}
        >
          <img
            className="block aspect-[16/10] w-full bg-gray-200 object-cover"
            src={video.thumbnailUrl}
            alt=""
            loading="lazy"
          />
          <h2 className="mx-4 mb-2 mt-4 text-lg font-semibold text-gray-900">
            {video.title}
          </h2>
        </button>
      ) : (
        <>
          <img
            className="block aspect-[16/10] w-full bg-gray-200 object-cover"
            src={video.thumbnailUrl}
            alt=""
            loading="lazy"
          />
          <h2 className="mx-4 mb-2 mt-4 text-lg font-semibold text-gray-900">
            {video.title}
          </h2>
        </>
      )}
      <p className="mx-4 mb-3 text-sm leading-relaxed text-slate-600">
        {video.description}
      </p>
      <p className="mx-4 mb-4 text-xs text-slate-500">
        {video.likes.toLocaleString()} likes · {video.shares.toLocaleString()} shares
      </p>
    </article>
  );
}
