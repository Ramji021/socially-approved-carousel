export interface VideoPlayerProps {
  src: string;
  title: string;
  poster?: string;
}

export function VideoPlayer({ src, title, poster }: VideoPlayerProps) {
  return <video src={src} title={title} poster={poster} controls playsInline />;
}
