export function PosterSkeleton() {
  return (
    <div className="shrink-0 w-[180px] md:w-[200px]">
      <div className="aspect-[2/3] rounded-xl bg-surface animate-pulse" />
      <div className="mt-3 h-3 w-3/4 rounded bg-surface animate-pulse" />
      <div className="mt-2 h-3 w-1/2 rounded bg-surface animate-pulse" />
    </div>
  );
}

export function RowSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="flex gap-4 px-6 lg:px-10 mx-auto max-w-[1600px] overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <PosterSkeleton key={i} />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative h-[88vh] min-h-[620px] w-full overflow-hidden bg-surface animate-pulse" />
  );
}
