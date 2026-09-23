import { Skeleton } from "@/components/ui/skeleton";

export function StatGridSkeleton({ count = 4 }: { count?: number }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: count }).map((_, i) => (
    <div key={i} className="surface-panel p-5"><div className="flex justify-between"><Skeleton className="h-3 w-24" /><Skeleton className="size-8 rounded-lg" /></div><Skeleton className="mt-5 h-9 w-16" /><Skeleton className="mt-3 h-3 w-36" /></div>
  ))}</div>;
}

export function DetailPageSkeleton() {
  return <div className="space-y-6" aria-label="Loading page"><Skeleton className="h-5 w-36" /><div className="surface-panel p-6"><Skeleton className="h-5 w-40" /><Skeleton className="mt-4 h-8 w-2/3" /><div className="mt-6 grid gap-4 sm:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div></div><div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]"><Skeleton className="h-96 rounded-xl" /><Skeleton className="h-96 rounded-xl" /></div></div>;
}
