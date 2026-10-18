export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
}

export function ProgressBar({ value, max = 100, label = "Progress" }: ProgressBarProps) {
  const progress = Math.min(Math.max(value, 0), max);

  return (
    <progress aria-label={label} value={progress} max={max}>
      {progress} / {max}
    </progress>
  );
}
