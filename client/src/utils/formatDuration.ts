export function formatDuration(durationInSeconds: number): string {
  const seconds = Math.max(0, Math.floor(durationInSeconds));
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}
