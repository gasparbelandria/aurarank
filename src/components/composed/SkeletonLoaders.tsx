import { cn } from "@/lib/cn";

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded shimmer-bg animate-shimmer",
        className
      )}
    />
  );
}

export function PostCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <Shimmer className="aspect-video w-full" />
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex flex-col gap-1.5">
          <Shimmer className="h-8 w-20" />
          <Shimmer className="h-3 w-16" />
        </div>
        <Shimmer className="h-9 w-16 rounded-lg" />
      </div>
      <div className="px-4 pb-3">
        <Shimmer className="h-3 w-3/4" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Shimmer className="size-24 rounded-full" />
      <Shimmer className="h-6 w-40" />
      <Shimmer className="h-16 w-28" />
      <Shimmer className="h-10 w-20" />
      <div className="flex gap-6">
        <Shimmer className="h-10 w-16" />
        <Shimmer className="h-10 w-16" />
      </div>
    </div>
  );
}

export function LeaderboardRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-elevated">
      <Shimmer className="size-8 rounded-full" />
      <Shimmer className="size-8 rounded-full" />
      <div className="flex-1">
        <Shimmer className="h-4 w-28 mb-1" />
        <Shimmer className="h-3 w-16" />
      </div>
      <Shimmer className="h-6 w-16" />
      <Shimmer className="h-4 w-8" />
    </div>
  );
}
