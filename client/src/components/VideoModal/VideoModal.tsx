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

  const firstVisibleIndex = Math.max(activeIndex - 1, 0);
  const visibleVideos = videos.slice(firstVisibleIndex, Math.min(activeIndex + 2, videos.length));

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
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/90 px-2 py-8 sm:px-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className="relative flex h-full w-full items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-label={`Video carousel: ${activeVideo.title}`}
        aria-roledescription="carousel"
      >
        <button
          ref={closeButtonRef}
          className="absolute right-2 top-0 z-50 inline-flex size-12 items-center justify-center rounded-full text-4xl font-light text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:right-4 sm:top-2"
          type="button"
          onClick={onClose}
          aria-label="Close video carousel"
          title="Close (Escape)"
        >
          <span aria-hidden="true">×</span>
        </button>

        <p className="absolute left-1/2 top-2 z-40 -translate-x-1/2 text-xs font-medium text-white/70 sm:text-sm" aria-live="polite">
          {activeIndex + 1} / {videos.length}
        </p>

        <div
          className="relative flex h-[min(82vh,780px)] w-full max-w-[1400px] touch-pan-y items-center justify-center"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          aria-label="Modal videos; swipe or drag horizontally to navigate"
        >
          {visibleVideos.map((video, visibleIndex) => {
            const index = firstVisibleIndex + visibleIndex;
            const isActive = index === activeIndex;
            const position = index - activeIndex;
            const slideClass = [
              "absolute left-1/2 top-1/2 block w-[min(78vw,390px)] -translate-y-1/2 overflow-hidden rounded-xl bg-black p-0 text-left shadow-2xl transition-[transform,opacity] duration-300 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-white",
              isActive
                ? "z-30 -translate-x-1/2 scale-100 opacity-100"
                : position < 0
                  ? "z-20 hidden -translate-x-[125%] scale-[0.82] cursor-pointer opacity-45 hover:opacity-65 md:block"
                  : "z-20 hidden translate-x-[25%] scale-[0.82] cursor-pointer opacity-45 hover:opacity-65 md:block",
            ].join(" ");

            if (isActive) {
              return (
                <div
                  className={slideClass}
                  key={video.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Video ${index + 1} of ${videos.length}: ${video.title}, active`}
                  aria-current="true"
                >
                  <VideoPlayer
                    src={video.videoUrl}
                    title={video.title}
                    poster={video.thumbnailUrl}
                    isActive
                    presentation="portrait"
                  />
                </div>
              );
            }

            return (
              <button
                className={slideClass}
                key={video.id}
                type="button"
                onClick={() => onActiveIndexChange(index)}
                aria-label={`Show video ${index + 1}: ${video.title}`}
              >
                  <img
                    className="aspect-[9/16] max-h-[82vh] w-full bg-gray-200 object-cover"
                    src={video.thumbnailUrl}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
              </button>
            );
          })}
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-40 flex -translate-y-1/2 items-center justify-between px-1 sm:px-8">
          <button
            className="pointer-events-auto grid size-10 place-items-center rounded-full bg-white text-xl font-medium text-gray-900 shadow-lg transition hover:scale-105 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 disabled:cursor-not-allowed disabled:opacity-40 sm:size-12"
            type="button"
            onClick={() => step(-1)}
            disabled={activeIndex === 0}
            aria-label="Previous video"
            title="Previous video (Left Arrow)"
          >
            <span aria-hidden="true">‹</span>
          </button>
          <button
            className="pointer-events-auto grid size-10 place-items-center rounded-full bg-white text-xl font-medium text-gray-900 shadow-lg transition hover:scale-105 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 disabled:cursor-not-allowed disabled:opacity-40 sm:size-12"
            type="button"
            onClick={() => step(1)}
            disabled={activeIndex === videos.length - 1}
            aria-label="Next video"
            title="Next video (Right Arrow)"
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </section>
    </div>
  );
}
