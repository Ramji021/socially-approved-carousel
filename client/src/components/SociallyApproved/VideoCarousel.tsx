import { useEffect, useRef } from "react";
import { VideoCard } from "../VideoCard/VideoCard";
import type { Video } from "../../types/video";

export interface VideoCarouselProps {
  videos: Video[];
  onSelect: (video: Video) => void;
}

export function VideoCarousel({ videos, onSelect }: VideoCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pointerStartX = useRef(0);
  const scrollStartX = useRef(0);
  const isDragging = useRef(false);
  const hasDragged = useRef(false);

  useEffect(() => {
    function stopDragging() {
      isDragging.current = false;
    }

    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);
    return () => {
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
    };
  }, []);

  function scroll(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;

    track.scrollBy({
      left: direction * track.clientWidth * 0.8,
      behavior: "smooth",
    });
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || event.button !== 0) return;

    isDragging.current = true;
    hasDragged.current = false;
    pointerStartX.current = event.clientX;
    scrollStartX.current = event.currentTarget.scrollLeft;
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging.current) return;

    const distance = event.clientX - pointerStartX.current;
    if (Math.abs(distance) > 5) hasDragged.current = true;
    if (hasDragged.current) {
      event.currentTarget.scrollLeft = scrollStartX.current - distance;
    }
  }

  function preventClickAfterDrag(event: React.MouseEvent<HTMLDivElement>) {
    if (!hasDragged.current) return;

    event.preventDefault();
    event.stopPropagation();
    hasDragged.current = false;
  }

  return (
    <section aria-label="Video carousel">
      <div className="mb-3 flex justify-end gap-2">
        <button
          className="grid size-10 place-items-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-sm transition hover:border-violet-400 hover:text-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 md:size-11"
          type="button"
          aria-label="Scroll videos left"
          onClick={() => scroll(-1)}
        >
          <span aria-hidden="true">←</span>
        </button>
        <button
          className="grid size-10 place-items-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-sm transition hover:border-violet-400 hover:text-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 md:size-11"
          type="button"
          aria-label="Scroll videos right"
          onClick={() => scroll(1)}
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-3 [scrollbar-width:none] [touch-action:pan-x] md:gap-5 [&::-webkit-scrollbar]:hidden"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onClickCapture={preventClickAfterDrag}
        aria-label="Videos; scroll horizontally to browse"
        role="region"
        tabIndex={0}
      >
        {videos.map((video) => (
          <div
            className="w-[min(78vw,340px)] shrink-0 snap-start sm:w-[min(45vw,340px)] lg:w-[min(31vw,360px)]"
            key={video.id}
          >
            <VideoCard video={video} onSelect={onSelect} />
          </div>
        ))}
      </div>
    </section>
  );
}
