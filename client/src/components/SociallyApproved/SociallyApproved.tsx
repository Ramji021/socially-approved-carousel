import type { PropsWithChildren } from "react";

export type SociallyApprovedProps = PropsWithChildren;

export function SociallyApproved({ children }: SociallyApprovedProps) {
  return <main className="app-shell">{children}</main>;
}
