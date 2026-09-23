import { LockKeyhole } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function ExpertCardSkeletons({ count = 6 }: { count?: number }) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: count }).map((_, i) => <div key={i} className="surface-panel p-5"><div className="flex justify-between"><Skeleton className="h-5 w-24" /><Skeleton className="h-5 w-20" /></div><Skeleton className="mt-5 h-5 w-4/5" /><Skeleton className="mt-3 h-4 w-2/3" /><div className="mt-6 flex gap-2"><Skeleton className="h-9 w-24" /><Skeleton className="h-9 w-28" /></div></div>)}</div>;
}
export function SignInState({ label = "live workspace data" }: { label?: string }) {
  return <div className="surface-panel flex min-h-56 flex-col items-center justify-center p-8 text-center"><LockKeyhole className="size-8 text-muted-foreground/50" /><p className="mt-3 font-display font-semibold">Sign in to load {label}</p><p className="mt-1 max-w-sm text-sm text-muted-foreground">The complete portal layout remains available for inspection before authentication.</p></div>;
}
