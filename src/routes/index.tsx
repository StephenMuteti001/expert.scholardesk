import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, Inbox, TrendingUp, Wallet } from "lucide-react";
import { ExpertShell } from "@/components/expert/ExpertShell";
import { ExpertCardSkeletons, SignInState } from "@/components/expert/ExpertStates";
import { Skeleton } from "@/components/ui/skeleton";
import { expertRequest } from "@/lib/expert-api";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Expert dashboard | ScholarDesk" }, { name: "description", content: "Review assignments, deadlines and earnings allocated by ScholarDesk support." }, { property: "og:title", content: "Expert dashboard | ScholarDesk" }, { property: "og:description", content: "Review assignments, deadlines and earnings allocated by ScholarDesk support." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { property: "og:image", content: "https://scholardesk.pro/brand/og-image.png" }, { name: "twitter:image", content: "https://scholardesk.pro/brand/og-image.png" }] }),
  component: ExpertDashboard,
});
type Stats = { active_jobs?: number; completed_orders?: number; total_earned?: number; pending_payout?: number; rating?: number };
type AssignmentRow = { id: string; title?: string; status?: string; deadline?: string | null };
function ExpertDashboard() {
  const stats = useQuery({ queryKey: ["expert-stats"], queryFn: () => expertRequest<Stats>("/expert/dashboard/statistics"), retry: false });
  const work = useQuery({ queryKey: ["expert-assignments"], queryFn: () => expertRequest<AssignmentRow[]>("/expert/assignments"), retry: false });
  const money = (n = 0) => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);
  const cards = [
    { label: "Active assignments", value: String(stats.data?.active_jobs ?? 0), icon: ClipboardList },
    { label: "Completed orders", value: String(stats.data?.completed_orders ?? 0), icon: Inbox },
    { label: "Pending payout", value: money(stats.data?.pending_payout), icon: TrendingUp },
    { label: "Total earned", value: money(stats.data?.total_earned), icon: Wallet },
  ];
  const rows = (work.data ?? []).slice(0, 3);
  return <ExpertShell title="Expert dashboard" description="Assignments allocated and managed by the support team."><div className="space-y-7">
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.isLoading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="surface-panel p-5"><Skeleton className="h-4 w-28" /><Skeleton className="mt-5 h-8 w-16" /></div>) : cards.map(({ label, value, icon: Icon }) => <div key={label} className="surface-panel p-5"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{label}</p><Icon className="size-4 text-primary" /></div><p className="mt-4 font-display text-2xl font-semibold">{value}</p></div>)}</section>
    <div className="flex items-center justify-between"><h2 className="font-display text-base font-semibold">Assigned to you</h2><Link to="/assignments" className="text-sm font-semibold text-primary">View all</Link></div>
    {work.isLoading ? <ExpertCardSkeletons count={3} /> : work.error ? <SignInState label="your assigned work" /> : rows.length === 0 ? <div className="surface-panel p-10 text-center"><p className="font-display font-semibold">No assignments yet</p><p className="mt-1 text-sm text-muted-foreground">Browse available orders and register interest to get matched.</p><Link to="/orders" search={{ tab: "new", q: "" }} className="mt-4 inline-flex rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">Browse available orders</Link></div> : <div className="grid gap-4 md:grid-cols-3">{rows.map(r => <Link key={r.id} to="/assignments/$orderId" params={{ orderId: r.id }} className="surface-panel block p-5"><p className="text-xs text-muted-foreground">{r.status}</p><p className="mt-2 font-display font-semibold">{r.title ?? "Assignment"}</p><p className="mt-2 text-xs text-muted-foreground">{r.deadline ? new Date(r.deadline).toLocaleString() : "Deadline pending"}</p></Link>)}</div>}
  </div></ExpertShell>;
}
