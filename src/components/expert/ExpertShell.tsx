import { Link, useRouterState } from "@tanstack/react-router";
import { ClipboardList, LayoutDashboard, Menu, SearchCheck, User, Wallet, X, LifeBuoy } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useSupportChat } from "@/components/portal/support-chat-context";
import brandMark from "@/assets/scholardesk-monogram.png.asset.json";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/orders", label: "Available orders", icon: SearchCheck },
  { to: "/assignments", label: "Assignments", icon: ClipboardList },
  { to: "/earnings", label: "Earnings", icon: Wallet },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function ExpertShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const [menu, setMenu] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { open } = useSupportChat();
  const nav = <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground"><div className="flex items-center gap-3 px-5 py-5"><img src={brandMark.url} alt="ScholarDesk" className="size-9 object-contain" /><div><p className="font-display text-sm font-semibold">ScholarDesk</p><p className="text-xs text-muted-foreground">Expert portal</p></div><button onClick={() => setMenu(false)} aria-label="Close menu" className="ml-auto lg:hidden"><X className="size-4" /></button></div><nav className="flex-1 space-y-1 overflow-y-auto px-3">{links.map(({ to, label, icon: Icon }) => <Link key={to} to={to} onClick={() => setMenu(false)} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium", pathname === to ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")}><Icon className="size-4" />{label}</Link>)}</nav><div className="m-3 border-t border-sidebar-border pt-3"><button onClick={() => open()} className="flex w-full items-center justify-center gap-2 rounded-lg bg-sidebar-primary px-3 py-2 text-xs font-semibold text-sidebar-primary-foreground"><LifeBuoy className="size-4" />Message support</button></div></div>;
  return <div className="min-h-screen bg-background"><aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-sidebar-border lg:block">{nav}</aside>{menu && <div className="fixed inset-0 z-50 lg:hidden"><button aria-label="Close navigation" className="absolute inset-0 bg-foreground/50" onClick={() => setMenu(false)} /><div className="absolute inset-y-0 left-0 w-64">{nav}</div></div>}<div className="lg:pl-64"><header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur"><div className="flex items-center gap-3 px-4 py-4 sm:px-6"><button onClick={() => setMenu(true)} aria-label="Open navigation" className="lg:hidden"><Menu className="size-5" /></button><div><h1 className="font-display text-xl font-semibold">{title}</h1><p className="text-xs text-muted-foreground sm:text-sm">{description}</p></div><span className="ml-auto rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">Preview access</span></div></header><main className="mx-auto max-w-[1400px] px-4 py-7 sm:px-6">{children}</main></div></div>;
}
