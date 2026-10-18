import { useCallback, useEffect, useRef, useState } from "react";
import { VideoControls } from "../VideoControls/VideoControls";

export type VideoPlayerState =
  | "idle"
  | "loading"
  | "ready"
  | "playing"
  | "paused"
  | "error";

export interface VideoPlayerProps {
  src: string;
  title: string;
  poster?: string;
  isActive?: boolean;
  presentation?: "landscape" | "portrait";
}

export function VideoPlayer({
  src,
  title,
  poster,
  isActive = true,
  presentation = "landscape",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressFrameRef = useRef<number | null>(null);
  const lastProgressUpdateRef = useRef(0);
  const playbackRequestRef = useRef(0);
  const shouldPlayRef = useRef(false);
  const [playerState, setPlayerState] = useState<VideoPlayerState>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isPlaying = playerState === "playing";
  const isLoading = playerState === "loading";
  const isError = playerState === "error";

  useEffect(() => {
    if (!isActive) {
      shouldPlayRef.current = false;
      playbackRequestRef.current += 1;
      videoRef.current?.pause();
    }
  }, [isActive]);

  useEffect(() => () => {
    if (progressFrameRef.current !== null) {
      cancelAnimationFrame(progressFrameRef.current);
    }
  }, []);

  const play = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !isActive) return;

    if (playerState === "loading" || (!video.paused && shouldPlayRef.current)) return;

    shouldPlayRef.current = true;
    const playbackRequest = ++playbackRequestRef.current;

    if (playerState === "idle" || playerState === "error") {
      setErrorMessage(null);
      setPlayerState("loading");
      if (playerState === "idle") {
        video.src = src;
      } else {
        video.load();
      }
    }

    try {
      await video.play();
      if (playbackRequest !== playbackRequestRef.current || !shouldPlayRef.current) {
        video.pause();
      } else if (!video.paused) {
        setPlayerState("playing");
      }
    } catch (playError) {
      if (playbackRequest !== playbackRequestRef.current || !shouldPlayRef.current) {
        return;
      }

      shouldPlayRef.current = false;
      setErrorMessage(
        playError instanceof DOMException && playError.name === "NotAllowedError"
          ? "Playback was blocked by the browser. Press Play to try again."
          : "Playback could not start. Check the video source and try again.",
      );
      setPlayerState("error");
    }
  }, [isActive, playerState, src]);

  const pause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    shouldPlayRef.current = false;
    playbackRequestRef.current += 1;
    video.pause();
    setPlayerState("paused");
  }, []);

  const togglePlayback = useCallback(() => {
    if (shouldPlayRef.current || (videoRef.current && !videoRef.current.paused)) {
      pause();
    } else {
      void play();
    }
  }, [pause, play]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video || !isActive) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, [isActive]);

  const seek = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video || !isActive || !Number.isFinite(video.duration)) return;

    video.currentTime = Math.min(Math.max(time, 0), video.duration);
    setCurrentTime(video.currentTime);
  }, [isActive]);

  function updateDuration() {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) {
      setDuration(null);
      return;
    }

    setDuration(video.duration);
  }

  function updateProgress() {
    if (progressFrameRef.current !== null) return;

    progressFrameRef.current = requestAnimationFrame((timestamp) => {
      progressFrameRef.current = null;
      if (timestamp - lastProgressUpdateRef.current < 200) return;

      lastProgressUpdateRef.current = timestamp;
      const video = videoRef.current;
      if (video && Number.isFinite(video.currentTime)) {
        setCurrentTime(video.currentTime);
      }
    });
  }

  function resetProgress() {
    if (progressFrameRef.current !== null) {
      cancelAnimationFrame(progressFrameRef.current);
      progressFrameRef.current = null;
    }
    lastProgressUpdateRef.current = 0;
    setCurrentTime(0);
    setDuration(null);
  }

  function finishProgress() {
    const video = videoRef.current;
    shouldPlayRef.current = false;
    setPlayerState("paused");
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
    setDuration(video.duration);
    setCurrentTime(video.duration);
  }

  function handleLoadStart() {
    setErrorMessage(null);
    setPlayerState("loading");
  }

  function handleLoadedData() {
    setPlayerState((state) => (
      state === "error"
        ? state
        : shouldPlayRef.current
          ? "playing"
          : "ready"
    ));
  }

  function handleCanPlay() {
    setPlayerState((state) => (
      state === "error"
        ? state
        : shouldPlayRef.current
          ? "playing"
          : "ready"
    ));
  }

  function handlePause() {
    const video = videoRef.current;
    if (video?.paused && shouldPlayRef.current) {
      shouldPlayRef.current = false;
      playbackRequestRef.current += 1;
    }

    setPlayerState((state) => {
      if (!shouldPlayRef.current && state !== "error" && video !== null &&
        video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        return "paused";
      }
      return state;
    });
  }

  function handleVideoError() {
    const mediaError = videoRef.current?.error;
    const message = mediaError?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
      ? "This video format or source is not supported."
      : "The video could not be loaded. Check your connection and try again.";
    setErrorMessage(message);
    setPlayerState("error");
  }

  const showVideo = ["ready", "playing", "paused"].includes(playerState);

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-black" data-player-state={playerState}>
      <div
        className={[
          "group relative w-full bg-gray-950",
          !showVideo && presentation === "portrait" ? "aspect-[9/16]" : "",
          !showVideo && presentation === "landscape" ? "aspect-video" : "",
        ].join(" ")}
      >
        <video
          key={src}
          ref={videoRef}
          className={[
            "w-full bg-black object-cover",
            presentation === "portrait"
              ? "aspect-[9/16] max-h-[82vh]"
              : "max-h-[65vh]",
            showVideo ? "block" : "hidden",
          ].join(" ")}
          title={title}
          poster={poster}
          playsInline
          preload="none"
          onLoadStart={handleLoadStart}
          onLoadedData={handleLoadedData}
          onCanPlay={handleCanPlay}
          onPlay={() => {
            if (!shouldPlayRef.current) {
              videoRef.current?.pause();
              return;
            }
            setPlayerState("playing");
          }}
          onPlaying={() => {
            if (shouldPlayRef.current) setPlayerState("playing");
          }}
          onPause={handlePause}
          onVolumeChange={() => setIsMuted(videoRef.current?.muted ?? false)}
          onLoadedMetadata={updateDuration}
          onDurationChange={updateDuration}
          onTimeUpdate={updateProgress}
          onSeeking={updateProgress}
          onEnded={finishProgress}
          onEmptied={resetProgress}
          onError={handleVideoError}
        />
        {showVideo && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <button
              className="pointer-events-none grid size-16 place-items-center rounded-full bg-black/65 text-white opacity-0 shadow-lg transition hover:scale-105 hover:bg-black/80 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white disabled:opacity-50"
              type="button"
              onClick={togglePlayback}
              disabled={!isActive || isLoading || isError}
              aria-label={isPlaying ? "Pause video" : "Play video"}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24" className="size-8 fill-current" aria-hidden="true">
                  <path d="M7 5h4v14H7zm6 0h4v14h-4z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="ml-1 size-8 fill-current" aria-hidden="true">
                  <path d="M7 4.5v15l12-7.5z" />
                </svg>
              )}
            </button>
          </div>
        )}
        {!showVideo && (
          <>
            {poster && (
              <img
                className={[
                  "absolute inset-0 size-full object-cover",
                  isError ? "opacity-30" : "",
                ].join(" ")}
                src={poster}
                alt=""
                loading="eager"
                decoding="async"
              />
            )}
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/35 text-sm text-white" role="status">
                <span
                  className="size-9 animate-spin rounded-full border-4 border-white/40 border-t-white"
                  aria-hidden="true"
                />
                Loading video…
              </div>
            )}
            {isError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/45 px-4 text-center">
                <p className="text-sm text-white" role="alert">{errorMessage}</p>
                <button
                  className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                  type="button"
                  onClick={play}
                  disabled={!isActive}
                >
                  Retry video
                </button>
              </div>
            )}
            {playerState === "idle" && (
              <button
                className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/65 text-white shadow-lg transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                type="button"
                onClick={play}
                disabled={!isActive}
                aria-label={`Load and play ${title}`}
              >
                <svg viewBox="0 0 24 24" className="ml-1 size-8 fill-current" aria-hidden="true">
                  <path d="M7 4.5v15l12-7.5z" />
                </svg>
              </button>
            )}
          </>
        )}
      </div>
      <VideoControls
        isMuted={isMuted}
        currentTime={currentTime}
        duration={duration}
        disabled={!isActive || isLoading || isError}
        onToggleMute={toggleMute}
        onSeek={seek}
      />
    </div>
  );
}
