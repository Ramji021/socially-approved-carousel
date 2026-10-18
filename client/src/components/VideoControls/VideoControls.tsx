import { ProgressBar } from "../ProgressBar/ProgressBar";

export interface VideoControlsProps {
  isMuted: boolean;
  currentTime: number;
  duration: number | null;
  disabled?: boolean;
  onToggleMute: () => void;
  onSeek: (time: number) => void;
}

export function VideoControls({
  isMuted,
  currentTime,
  duration,
  disabled = false,
  onToggleMute,
  onSeek,
}: VideoControlsProps) {
  return (
    <div
      className="rounded-b-xl bg-gray-950 py-2 text-white"
      role="group"
      aria-label="Video controls"
    >
      <ProgressBar
        currentTime={currentTime}
        duration={duration}
        disabled={disabled}
        onSeek={onSeek}
      />
      <div className="flex items-center gap-3 px-3">
        <button
          className="inline-flex size-10 items-center justify-center rounded-full hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white disabled:opacity-50"
          type="button"
          onClick={onToggleMute}
          disabled={disabled}
          aria-label={isMuted ? "Unmute video" : "Mute video"}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden="true">
              <path d="M3 9v6h4l5 4V5L7 9zm13.59 3L14 9.41 15.41 8 18 10.59 20.59 8 22 9.41 19.41 12 22 14.59 20.59 16 18 13.41 15.41 16 14 14.59z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden="true">
              <path d="M3 9v6h4l5 4V5L7 9zm12.5 3a3.5 3.5 0 0 0-2-3.16v6.31a3.5 3.5 0 0 0 2-3.15M13.5 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54" />
            </svg>
          )}
        </button>
      </div>
      <span className="sr-only" aria-live="polite">
        {isMuted ? "Muted" : "Unmuted"}
      </span>
    </div>
  );
}
