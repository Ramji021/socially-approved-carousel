import type { PropsWithChildren } from "react";

export interface VideoModalProps extends PropsWithChildren {
  isOpen: boolean;
  title: string;
  onClose: () => void;
}

export function VideoModal({ isOpen, title, onClose, children }: VideoModalProps) {
  if (!isOpen) return null;

  return (
    <section role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" onClick={onClose} aria-label="Close dialog">
        Close
      </button>
      {children}
    </section>
  );
}
