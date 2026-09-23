import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Loader2 } from "lucide-react";

import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/format";
import type { NotificationItem } from "@/types/portal";
import AppShell from "@/components/layout/AppShell";
import EmptyState from "@/components/EmptyState";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — AcademicHub Expert Portal" },
      { name: "description", content: "Assignment updates, messages and payout alerts." },
      { property: "og:title", content: "Notifications — AcademicHub Expert Portal" },
      { property: "og:description", content: "Assignment updates, messages and payout alerts." },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async (): Promise<NotificationItem[]> => {
      const { data } = await api.get("/notifications", { params: { limit: 50 } });
      return data?.notifications ?? data?.data ?? [];
    },
  });

  useEffect(() => {
    void api
      .post("/notifications/mark-seen")
      .then(() => queryClient.invalidateQueries({ queryKey: ["notifications-unread"] }))
      .catch(() => undefined);
  }, [queryClient]);

  return (
    <AppShell title="Notifications" description="Everything that needs your attention.">
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={Bell}
          title="You're all caught up"
          description="New assignments, messages and payouts will show up here."
        />
      ) : (
        <ul className="surface-card divide-y divide-border">
          {data!.map((item) => (
            <li
              key={item.id}
              className={cn("flex gap-3 px-4 py-3.5", !item.is_read && !item.seen && "bg-primary-soft/50")}
            >
              <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <Bell className="h-4 w-4 text-muted-foreground" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">{item.title || "Update"}</p>
                {item.message && (
                  <p className="mt-0.5 text-sm text-muted-foreground">{item.message}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">{timeAgo(item.created_at)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
