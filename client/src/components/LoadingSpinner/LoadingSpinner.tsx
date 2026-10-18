export interface LoadingSpinnerProps {
  label?: string;
}

export function LoadingSpinner({ label = "Loading" }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center gap-3 text-slate-600" role="status">
      <span
        className="size-5 animate-spin rounded-full border-2 border-violet-200 border-t-violet-700"
        aria-hidden="true"
      />
      {label}
    </div>
  );
}
