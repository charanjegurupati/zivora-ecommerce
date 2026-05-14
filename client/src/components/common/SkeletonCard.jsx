export const SkeletonCard = () => (
  <div className="surface-panel overflow-hidden">
    <div className="aspect-[4/5] animate-pulse bg-sand-100" />
    <div className="space-y-3 p-5">
      <div className="h-4 w-24 animate-pulse rounded-full bg-sand-100" />
      <div className="h-5 w-4/5 animate-pulse rounded-full bg-sand-100" />
      <div className="h-4 w-full animate-pulse rounded-full bg-sand-100" />
      <div className="h-10 w-full animate-pulse rounded-full bg-sand-100" />
    </div>
  </div>
);
