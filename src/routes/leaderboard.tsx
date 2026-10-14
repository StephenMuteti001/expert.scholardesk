import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Trophy } from "lucide-react";

import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";
import AppShell from "@/components/layout/AppShell";
import EmptyState from "@/components/EmptyState";

interface LeaderboardRow {
  id: string | number;
  rank?: number;
  name?: string;
  completed_orders?: number;
  rating?: number;
  score?: number;
  is_me?: boolean;
}

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — ScholarDesk Expert Portal" },
      { name: "description", content: "See how your delivery record compares with other experts." },
      { property: "og:title", content: "Leaderboard — ScholarDesk Expert Portal" },
      {
        property: "og:description",
        content: "See how your delivery record compares with other experts.",
      },
     { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { property: "og:image", content: "https://scholardesk.pro/brand/og-image.png" }, { name: "twitter:image", content: "https://scholardesk.pro/brand/og-image.png" }],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const board = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async (): Promise<LeaderboardRow[]> => {
      const { data } = await api.get("/profile/leaderboard");
      return data?.leaderboard ?? data?.data ?? [];
    },
  });

  const me = useQuery({
    queryKey: ["leaderboard-me"],
    queryFn: async (): Promise<LeaderboardRow | null> => {
      const { data } = await api.get("/profile/leaderboard/me");
      return data?.data ?? data ?? null;
    },
  });

  return (
    <AppShell title="Leaderboard" description="Ranking is based on delivery quality and volume.">
      <div className="space-y-5">
        {me.data && (
          <div className="surface-card flex items-center justify-between gap-4 p-5">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Your position</p>
              <p className="mt-1 text-2xl font-semibold">#{me.data.rank ?? "—"}</p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>{me.data.completed_orders ?? 0} completed</p>
              <p>Rating {me.data.rating ?? "—"}</p>
            </div>
          </div>
        )}

        {board.isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (board.data?.length ?? 0) === 0 ? (
          <EmptyState
            icon={Trophy}
            title="Leaderboard is warming up"
            description="Rankings appear once experts start completing assignments."
          />
        ) : (
          <ul className="surface-card divide-y divide-border">
            {board.data!.map((row, index) => (
              <li
                key={row.id}
                className={cn("flex items-center gap-4 px-4 py-3", row.is_me && "bg-primary-soft/60")}
              >
                <span className="w-6 text-sm font-semibold text-muted-foreground">
                  {row.rank ?? index + 1}
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {initials(row.name || "Expert")}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {row.name || "Expert"}
                </span>
                <span className="text-sm text-muted-foreground">
                  {row.completed_orders ?? 0} orders
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
