export function PricingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3" aria-busy="true" aria-live="polite">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col rounded-3xl border border-border bg-card p-7"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="skeleton-shimmer h-6 w-24" />
          <div className="skeleton-shimmer mt-2 h-3 w-40" />
          <div className="skeleton-shimmer mt-6 h-10 w-32" />
          <div className="skeleton-shimmer mt-6 h-10 w-full rounded-md" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 5 }).map((__, j) => (
              <div key={j} className="flex items-start gap-2">
                <div className="skeleton-shimmer mt-0.5 h-4 w-4 rounded" />
                <div className="skeleton-shimmer h-3 w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
