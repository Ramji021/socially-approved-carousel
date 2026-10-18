import type { PropsWithChildren } from "react";

export function VideoControls({ children }: PropsWithChildren) {
  return <div aria-label="Video controls">{children}</div>;
}
