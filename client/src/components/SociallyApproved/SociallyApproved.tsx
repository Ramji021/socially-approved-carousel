import type { PropsWithChildren } from "react";

export type SociallyApprovedProps = PropsWithChildren;

export function SociallyApproved({ children }: SociallyApprovedProps) {
  return (
    <main className="mx-auto w-[min(1280px,calc(100%-32px))] py-8 sm:py-12">
      {children}
    </main>
  );
}
