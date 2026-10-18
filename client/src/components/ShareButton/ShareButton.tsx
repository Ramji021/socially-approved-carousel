import type { SharePlatform } from "../../types/video";

export interface ShareButtonProps {
  platform: SharePlatform;
  onShare: (platform: SharePlatform) => void;
  disabled?: boolean;
}

export function ShareButton({ platform, onShare, disabled = false }: ShareButtonProps) {
  return (
    <button type="button" disabled={disabled} onClick={() => onShare(platform)}>
      Share
    </button>
  );
}
