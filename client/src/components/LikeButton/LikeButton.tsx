export interface LikeButtonProps {
  likes: number;
  isLiked: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

export function LikeButton({ likes, isLiked, disabled = false, onToggle }: LikeButtonProps) {
  return (
    <button type="button" aria-pressed={isLiked} disabled={disabled} onClick={onToggle}>
      {isLiked ? "Liked" : "Like"} ({likes})
    </button>
  );
}
