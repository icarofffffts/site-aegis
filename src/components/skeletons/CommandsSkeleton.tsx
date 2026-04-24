export function CommandsSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-live="polite">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border bg-surface/60 p-5"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="skeleton-shimmer h-5 w-28" />
            <div className="skeleton-shimmer h-4 w-16 rounded-full" />
          </div>
          <div className="skeleton-shimmer mt-3 h-3 w-full" />
          <div className="skeleton-shimmer mt-2 h-3 w-4/5" />
          <div className="skeleton-shimmer mt-4 h-9 w-full rounded-md" />
          <div className="mt-3 flex flex-wrap gap-2">
            <div className="skeleton-shimmer h-4 w-24 rounded" />
            <div className="skeleton-shimmer h-4 w-16 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
