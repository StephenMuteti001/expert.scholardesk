import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, Inbox, TrendingUp, Wallet } from "lucide-react";
import { ExpertShell } from "@/components/expert/ExpertShell";
import { ExpertCardSkeletons, SignInState } from "@/components/expert/ExpertStates";
import { Skeleton } from "@/components/ui/skeleton";
import { expertRequest, ExpertAuthRequiredError } from "@/lib/expert-api";

type Summary = { availableOrders?: number; activeAssignments?: number; available?: number; pending?: number };
export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Expert dashboard | ScholarDesk" }, { name: "description", content: "Review assignments, deadlines and earnings allocated by ScholarDesk support." }, { property: "og:title", content: "Expert dashboard | ScholarDesk" }, { property: "og:description", content: "Review assignments, deadlines and earnings allocated by ScholarDesk support." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { property: "og:image", content: "https://id-preview--839df7bd-e22a-4d73-94bf-d47003f523e8.lovable.app/__l5e/assets-v1/6e0c32a5-d6b8-47e2-8d01-b323453c54b7/scholardesk-og-image.png" }, { name: "twitter:image", content: "https://id-preview--839df7bd-e22a-4d73-94bf-d47003f523e8.lovable.app/__l5e/assets-v1/6e0c32a5-d6b8-47e2-8d01-b323453c54b7/scholardesk-og-image.png" }] }),
  component: ExpertDashboard,
});
function ExpertDashboard() {
  const query = useQuery({ queryKey: ["expert-summary"], queryFn: () => expertRequest<Summary>("/dashboard"), retry: false });
  const authRequired = query.error instanceof ExpertAuthRequiredError;
  const stats = [{ label: "Available orders", value: query.data?.availableOrders ?? 0, icon: Inbox }, { label: "Active assignments", value: query.data?.activeAssignments ?? 0, icon: ClipboardList }, { label: "Available balance", value: `$${query.data?.available ?? 0}`, icon: Wallet }, { label: "Pending earnings", value: `$${query.data?.pending ?? 0}`, icon: TrendingUp }];
  return <ExpertShell title="Expert dashboard" description="Assignments allocated and managed by the support team."><div className="space-y-7"><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{query.isLoading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="surface-panel p-5"><Skeleton className="h-4 w-28" /><Skeleton className="mt-5 h-8 w-16" /><Skeleton className="mt-3 h-3 w-32" /></div>) : stats.map(({ label, value, icon: Icon }) => <div key={label} className="surface-panel p-5"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{label}</p><Icon className="size-4 text-primary" /></div><p className="mt-4 font-display text-2xl font-semibold">{value}</p><p className="mt-1 text-xs text-muted-foreground">Updated from your live workspace</p></div>)}</section><div className="flex items-center justify-between"><h2 className="font-display text-base font-semibold">Assigned to you</h2><Link to="/assignments" className="text-sm font-semibold text-primary">View assignments</Link></div>{query.isLoading ? <ExpertCardSkeletons count={3} /> : authRequired ? <SignInState label="your assigned work" /> : <SignInState label="your assigned work" />}</div></ExpertShell>;
}
