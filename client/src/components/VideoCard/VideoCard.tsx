import { memo } from "react";
import type { Video } from "../../types/video";

export interface VideoCardProps {
  video: Video;
  onSelect?: (video: Video) => void;
}

function VideoCardComponent({ video, onSelect }: VideoCardProps) {
  return (
    <div className="overflow-hidden rounded-xl bg-gray-200">
      <button
        className="group relative block aspect-[4/5] w-full overflow-hidden bg-gray-200 p-0 text-left text-inherit focus-visible:outline focus-visible:outline-4 focus-visible:outline-violet-600"
        type="button"
        onClick={() => onSelect?.(video)}
        aria-label={`Play ${video.title}`}
      >
        <img
          className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={video.thumbnailUrl}
          alt=""
          loading="lazy"
          decoding="async"
        />
        <span
          className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-black/10"
          aria-hidden="true"
        />
        <span
          className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-gray-950 opacity-90 shadow-lg transition group-hover:scale-110 group-hover:bg-white sm:size-14"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" className="ml-0.5 size-6 fill-current" aria-hidden="true">
            <path d="M7 4.5v15l12-7.5z" />
          </svg>
        </span>
        <span className="absolute inset-x-0 bottom-0 p-4 text-left sm:p-5">
          <span className="block text-base font-semibold leading-snug text-white sm:text-lg">
            {video.title}
          </span>
          <span className="mt-2 block text-xs font-medium text-white/80 sm:text-sm">
            {video.likes.toLocaleString()} likes
          </span>
        </span>
      </button>
    </div>
  );
}

export const VideoCard = memo(VideoCardComponent);
