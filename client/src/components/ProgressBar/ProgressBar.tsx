import { formatDuration } from "../../utils/formatDuration";

export interface ProgressBarProps {
  currentTime: number;
  duration: number | null;
  onSeek: (time: number) => void;
  disabled?: boolean;
}

export function ProgressBar({
  currentTime,
  duration,
  onSeek,
  disabled = false,
}: ProgressBarProps) {
  const hasDuration = duration !== null && Number.isFinite(duration) && duration > 0;
  const progress = hasDuration
    ? Math.min(Math.max((currentTime / duration) * 100, 0), 100)
    : 0;
  const seekDisabled = disabled || !hasDuration;

  return (
    <div className="flex items-center gap-3 px-3 py-2 text-xs tabular-nums text-gray-300">
      <span aria-hidden="true">{formatDuration(currentTime)}</span>
      <input
        className="h-2 min-w-0 flex-1 cursor-pointer appearance-none rounded-full accent-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
        type="range"
        min={0}
        max={100}
        step={0.1}
        value={progress}
        disabled={seekDisabled}
        aria-label="Seek video"
        aria-valuetext={
          hasDuration
            ? `${formatDuration(currentTime)} of ${formatDuration(duration)}`
            : "Video duration unavailable"
        }
        onChange={(event) => {
          if (hasDuration) {
            onSeek((Number(event.currentTarget.value) / 100) * duration);
          }
        }}
      />
      <span aria-hidden="true">
        {hasDuration ? formatDuration(duration) : "--:--"}
      </span>
      {!hasDuration && (
        <span className="sr-only">Video duration is not available; seeking is disabled.</span>
      )}
    </div>
  );
}
