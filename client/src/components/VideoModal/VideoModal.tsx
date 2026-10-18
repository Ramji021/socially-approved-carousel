import { useEffect } from "react";
import type { PropsWithChildren } from "react";

export interface VideoModalProps extends PropsWithChildren {
  isOpen: boolean;
  title: string;
  onClose: () => void;
}

export function VideoModal({ isOpen, title, onClose, children }: VideoModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col items-end overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
      <button type="button" onClick={onClose} aria-label="Close dialog">
        <span className="mb-3 inline-flex size-10 items-center justify-center rounded-full text-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600">
          ×
        </span>
      </button>
      {children}
      </section>
    </div>
  );
}
