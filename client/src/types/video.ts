export interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  likes: number;
  shares: number;
  duration: number;
}

export type SharePlatform = "copy" | "web-share" | "whatsapp" | "facebook" | "twitter";
