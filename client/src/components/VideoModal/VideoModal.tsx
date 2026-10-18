import { useEffect, useRef } from "react";
import { VideoPlayer } from "../VideoPlayer/VideoPlayer";
import type { Video } from "../../types/video";

export interface VideoModalProps {
  isOpen: boolean;
  videos: Video[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onClose: () => void;
}

const SWIPE_THRESHOLD = 48;

export function VideoModal({
  isOpen,
  videos,
  activeIndex,
  onActiveIndexChange,
  onClose,
}: VideoModalProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const mouseStartX = useRef<number | null>(null);
  const mouseCurrentX = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousScrollY = window.scrollY;
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    document.body.style.overflow = "hidden";
    document.querySelectorAll("video").forEach((video) => video.pause());
    closeButtonRef.current?.focus({ preventScroll: true });

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
      window.scrollTo(0, previousScrollY);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Tab") {
        const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), video[controls], [tabindex]:not([tabindex="-1"])',
        );
        if (!focusableElements?.length) {
          event.preventDefault();
          return;
        }

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
        return;
      }

      if (
        event.target instanceof HTMLElement &&
        event.target.closest("video, input, textarea, select, [contenteditable='true']")
      ) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onActiveIndexChange(Math.max(0, activeIndex - 1));
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        onActiveIndexChange(Math.min(videos.length - 1, activeIndex + 1));
      } else if (event.key === "Home") {
        event.preventDefault();
        onActiveIndexChange(0);
      } else if (event.key === "End") {
        event.preventDefault();
        onActiveIndexChange(videos.length - 1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, isOpen, onActiveIndexChange, onClose, videos.length]);

  useEffect(() => {
    if (!isOpen) return;

    function handleMouseMove(event: MouseEvent) {
      if (mouseStartX.current !== null) {
        mouseCurrentX.current = event.clientX;
      }
    }

    function handleMouseUp() {
      if (mouseStartX.current === null || mouseCurrentX.current === null) return;

      const distance = mouseCurrentX.current - mouseStartX.current;
      mouseStartX.current = null;
      mouseCurrentX.current = null;

      if (Math.abs(distance) >= SWIPE_THRESHOLD) {
        onActiveIndexChange(
          Math.min(Math.max(activeIndex + (distance < 0 ? 1 : -1), 0), videos.length - 1),
        );
      }
    }

    function handleMouseCancel() {
      mouseStartX.current = null;
      mouseCurrentX.current = null;
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      handleMouseCancel();
    };
  }, [activeIndex, isOpen, onActiveIndexChange, videos.length]);

  if (!isOpen || videos.length === 0) return null;

  const activeVideo = videos[activeIndex];
  if (!activeVideo) return null;

  const firstVisibleIndex = Math.min(
    Math.max(activeIndex - 1, 0),
    Math.max(videos.length - 3, 0),
  );
  const visibleVideos = videos.slice(firstVisibleIndex, firstVisibleIndex + 3);

  function step(direction: -1 | 1) {
    onActiveIndexChange(Math.min(Math.max(activeIndex + direction, 0), videos.length - 1));
  }

  function handleMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    if (event.button !== 0 || (event.target as HTMLElement).closest("video")) return;
    mouseStartX.current = event.clientX;
    mouseCurrentX.current = event.clientX;
  }

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    const startX = touchStartX.current;
    const endX = event.changedTouches[0]?.clientX;
    touchStartX.current = null;
    if (startX === null || endX === undefined) return;

    const distance = endX - startX;
    if (Math.abs(distance) >= SWIPE_THRESHOLD) {
      step(distance < 0 ? 1 : -1);
    }
  }

  function handleTouchCancel() {
    touchStartX.current = null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-3 sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className="relative w-full max-w-6xl rounded-2xl bg-white p-4 shadow-2xl sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label={`Video carousel: ${activeVideo.title}`}
        aria-roledescription="carousel"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-slate-600" aria-live="polite">
            Video {activeIndex + 1} of {videos.length}
          </p>
          <button
            ref={closeButtonRef}
            className="inline-flex size-10 items-center justify-center rounded-full text-2xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600"
            type="button"
            onClick={onClose}
            aria-label="Close video carousel"
            title="Close (Escape)"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div
          className="flex items-stretch gap-3 [touch-action:pan-y]"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          aria-label="Modal videos; swipe or drag horizontally to navigate"
        >
          {visibleVideos.map((video, visibleIndex) => {
            const index = firstVisibleIndex + visibleIndex;
            const isActive = index === activeIndex;

            return (
              <div
                className={[
                  isActive ? "flex" : "hidden md:flex",
                  "min-w-0 flex-1 flex-col",
                ].join(" ")}
                key={video.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`Video ${index + 1} of ${videos.length}: ${video.title}${isActive ? ", active" : ""}`}
                aria-current={isActive ? "true" : undefined}
              >
                {isActive ? (
                  <VideoPlayer
                    src={video.videoUrl}
                    title={video.title}
                    poster={video.thumbnailUrl}
                  />
                ) : (
                  <img
                    className="aspect-video w-full rounded-xl bg-gray-200 object-cover"
                    src={video.thumbnailUrl}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <h2 className="mt-3 text-base font-semibold text-gray-900 sm:text-lg">
                  {video.title}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600">
                  {video.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <button
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 disabled:cursor-not-allowed disabled:opacity-40"
            type="button"
            onClick={() => step(-1)}
            disabled={activeIndex === 0}
            aria-label="Previous video"
            title="Previous video (Left Arrow)"
          >
            <span aria-hidden="true">←</span>
            <span className="ml-2">Previous</span>
          </button>
          <span className="text-xs text-slate-500">
            Use ← and → to navigate
          </span>
          <button
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 disabled:cursor-not-allowed disabled:opacity-40"
            type="button"
            onClick={() => step(1)}
            disabled={activeIndex === videos.length - 1}
            aria-label="Next video"
            title="Next video (Right Arrow)"
          >
            <span className="mr-2">Next</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>
    </div>
  );
}
