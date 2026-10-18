export interface LikeButtonProps {
  likes: number;
  isLiked: boolean;
  isPending?: boolean;
  error?: string;
  disabled?: boolean;
  variant?: "default" | "rail";
  onToggle: () => void;
}

export function LikeButton({
  likes,
  isLiked,
  isPending = false,
  error,
  disabled = false,
  variant = "default",
  onToggle,
}: LikeButtonProps) {
  if (variant === "rail") {
    return (
      <span className="inline-flex flex-col items-center gap-1">
        <button
          className={[
            "grid size-11 place-items-center rounded-full text-white transition hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-70",
            isLiked ? "text-rose-500" : "text-white",
          ].join(" ")}
          type="button"
          aria-pressed={isLiked}
          aria-label={`${isLiked ? "Liked" : "Like"}; ${likes.toLocaleString()} likes`}
          aria-busy={isPending}
          disabled={disabled || isLiked || isPending}
          onClick={onToggle}
        >
          <svg viewBox="0 0 24 24" className="size-8" aria-hidden="true">
            <path
              d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"
              fill={isLiked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <span className="text-xs font-medium leading-none text-white">
          {isPending ? "Saving…" : "Like"}
        </span>
        {error && <span className="max-w-28 text-center text-xs text-white" role="alert">{error}</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        className={[
          "inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-70",
          isLiked
            ? "bg-rose-600 text-white hover:bg-rose-700"
            : "bg-black/65 text-white hover:bg-black/80",
        ].join(" ")}
        type="button"
        aria-pressed={isLiked}
        aria-label={`${isLiked ? "Liked" : "Like"}; ${likes.toLocaleString()} likes`}
        aria-busy={isPending}
        disabled={disabled || isLiked || isPending}
        onClick={onToggle}
      >
        <span className={isLiked ? "text-white" : ""} aria-hidden="true">
          {isPending ? "…" : isLiked ? "♥" : "♡"}
        </span>
        <span>{isPending ? "Saving…" : likes.toLocaleString()}</span>
      </button>
      {error && <span className="max-w-48 text-xs font-medium text-white" role="alert">{error}</span>}
    </span>
  );
}
