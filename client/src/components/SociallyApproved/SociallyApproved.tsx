import type { PropsWithChildren } from "react";

export type SociallyApprovedProps = PropsWithChildren;

export function SociallyApproved({ children }: SociallyApprovedProps) {
  return (
    <main className="mx-auto w-[min(1120px,calc(100%-32px))] py-12">
      {children}
    </main>
  );
}
