import { useState } from "react";
import type { SharePlatform } from "../../types/video";

export interface ShareButtonProps {
  title: string;
  videoUrl: string;
  shares: number;
  isPending?: boolean;
  error?: string;
  variant?: "default" | "rail";
  onShare: (platform: SharePlatform) => Promise<void>;
}

const platforms: Array<{ id: SharePlatform; label: string }> = [
  { id: "copy", label: "Copy link" },
  { id: "web-share", label: "More options…" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "facebook", label: "Facebook" },
  { id: "twitter", label: "X / Twitter" },
];

function getShareUrl(videoUrl: string): string {
  return new URL(videoUrl, window.location.href).toString();
}

export function ShareButton({
  title,
  videoUrl,
  shares,
  isPending = false,
  error,
  variant = "default",
  onShare,
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState("");

  async function share(platform: SharePlatform) {
    const url = getShareUrl(videoUrl);
    const text = `Watch ${title}`;
    let trackedPlatform = platform;

    try {
      if (platform === "copy") {
        await navigator.clipboard.writeText(url);
        setStatus("Link copied");
      } else if (platform === "web-share") {
        if (navigator.share) {
          await navigator.share({ title, text, url });
        } else {
          await navigator.clipboard.writeText(url);
          trackedPlatform = "copy";
          setStatus("Link copied");
        }
      } else {
        const shareUrl = new URL(
          platform === "whatsapp"
            ? "https://api.whatsapp.com/send"
            : platform === "facebook"
              ? "https://www.facebook.com/sharer/sharer.php"
              : "https://twitter.com/intent/tweet",
        );
        if (platform === "whatsapp") {
          shareUrl.searchParams.set("text", `${text}: ${url}`);
        } else {
          shareUrl.searchParams.set("url", url);
          if (platform === "twitter") shareUrl.searchParams.set("text", text);
        }

        const link = document.createElement("a");
        link.href = shareUrl.toString();
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.click();
      }

      await onShare(trackedPlatform);
      setIsOpen(false);
    } catch (shareError: unknown) {
      if (
        shareError instanceof DOMException &&
        (shareError.name === "AbortError" || shareError.name === "NotAllowedError") &&
        platform === "web-share"
      ) {
        setIsOpen(false);
        return;
      }

      setStatus(
        shareError instanceof Error
          ? shareError.message
          : "Sharing is unavailable in this browser.",
      );
    }
  }

  return (
    <div className={[
      "relative inline-flex gap-1",
      variant === "rail" ? "flex-col items-center" : "flex-col items-end",
    ].join(" ")}>
      <button
        className={variant === "rail"
          ? "grid size-11 place-items-center rounded-full text-white transition hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-70"
          : "inline-flex items-center gap-1 rounded-full bg-black/65 px-3 py-2 text-sm font-semibold text-white transition hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-70"}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`Share video; ${shares.toLocaleString()} shares`}
        aria-busy={isPending}
        disabled={isPending}
        onClick={() => {
          setStatus("");
          setIsOpen((open) => !open);
        }}
      >
        {variant === "rail" ? (
          <svg viewBox="0 0 24 24" className="size-7" aria-hidden="true">
            <path
              d="m21 3-7.2 18-3.9-7.1L3 10.1 21 3Zm-11.1 10.9L21 3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <>
            <span aria-hidden="true">↗</span>
            <span>{isPending ? "Sharing…" : `Share · ${shares.toLocaleString()}`}</span>
          </>
        )}
      </button>
      {variant === "rail" && (
        <span className="text-xs font-medium leading-none text-white">
          {isPending ? "Sharing…" : "Share"}
        </span>
      )}
      {isOpen && (
        <div
          className={[
            "absolute z-50 grid min-w-40 gap-1 rounded-xl bg-white p-2 text-sm text-gray-900 shadow-xl",
            variant === "rail"
              ? "right-full top-1/2 mr-3 -translate-y-1/2"
              : "right-0 top-full mt-2",
          ].join(" ")}
          role="menu"
          aria-label="Share options"
        >
          {platforms.map(({ id, label }) => (
            <button
              className="rounded-lg px-3 py-2 text-left hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600"
              key={id}
              type="button"
              role="menuitem"
              onClick={() => void share(id)}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {(status || error) && (
        <span
          className="max-w-56 rounded bg-black/80 px-2 py-1 text-xs font-medium text-white"
          role={error ? "alert" : "status"}
        >
          {error ?? status}
        </span>
      )}
    </div>
  );
}
