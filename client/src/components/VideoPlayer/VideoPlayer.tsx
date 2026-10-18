export interface VideoPlayerProps {
  src: string;
  title: string;
  poster?: string;
}

export function VideoPlayer({ src, title, poster }: VideoPlayerProps) {
  return (
    <video
      className="max-h-[65vh] w-full rounded-xl bg-black"
      src={src}
      title={title}
      poster={poster}
      controls
      playsInline
      preload="none"
    />
  );
}
