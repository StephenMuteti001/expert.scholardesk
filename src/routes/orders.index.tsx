import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, ClipboardList, Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";

import api, { apiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAssignments, type AssignmentBucket } from "@/hooks/useAssignments";
import AppShell from "@/components/layout/AppShell";
import EmptyState from "@/components/EmptyState";
import OrderCard from "@/components/orders/OrderCard";
import OrdersTable from "@/components/orders/OrdersTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TABS: { value: AssignmentBucket; label: string; hint: string }[] = [
  { value: "new", label: "New", hint: "Assigned by support — accept or decline" },
  { value: "active", label: "In progress", hint: "Work you have accepted" },
  { value: "completed", label: "Completed", hint: "Delivered and approved" },
  { value: "cancelled", label: "Cancelled", hint: "Withdrawn or declined" },
];

export const Route = createFileRoute("/orders/")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (["new", "active", "completed", "cancelled"] as const).includes(search['tab'] as AssignmentBucket)
      ? (search['tab'] as AssignmentBucket)
      : ("new" as AssignmentBucket),
    q: typeof search['q'] === "string" ? (search['q'] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "Assignments — ScholarDesk Expert Portal" },
      {
        name: "description",
        content: "Every order the support team has assigned to you, grouped by stage.",
      },
      { property: "og:title", content: "Assignments — ScholarDesk Expert Portal" },
      {
        property: "og:description",
        content: "Every order the support team has assigned to you, grouped by stage.",
      },
    ],
  }),
  component: AssignmentsPage,
});

function AssignmentsPage() {
  const { tab, q } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState(q);

  const { data, isLoading } = useAssignments(tab, { search: q });
  const orders = data ?? [];

  const respond = useMutation({
    mutationFn: async ({ orderId, action }: { orderId: string; action: "accept" | "decline" }) => {
      await api.post(`/orders/${orderId}/${action}`);
      return action;
    },
    onSuccess: (action) => {
      toast.success(action === "accept" ? "Assignment accepted" : "Assignment declined");
      void queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Could not update this assignment")),
  });

  const activeTab = TABS.find((item) => item.value === tab)!;

  return (
    <AppShell title="Assignments" description={activeTab.hint}>
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-surface p-1">
            {TABS.map((item) => (
              <button
                key={item.value}
                onClick={() => navigate({ to: "/orders", search: { tab: item.value, q } })}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  tab === item.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <form
            className="relative w-full sm:w-64"
            onSubmit={(event) => {
              event.preventDefault();
              void navigate({ to: "/orders", search: { tab, q: search } });
            }}
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by order ID or title"
              className="pl-9"
            />
          </form>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={tab === "new" ? "No new assignments" : "Nothing here yet"}
            description={
              tab === "new"
                ? "The support team assigns orders to you. New ones land here instantly."
                : "Assignments will appear in this tab as they move through each stage."
            }
          />
        ) : tab === "new" ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                footer={
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      size="sm"
                      disabled={respond.isPending}
                      onClick={() => respond.mutate({ orderId: String(order.id), action: "accept" })}
                    >
                      <Check className="mr-1.5 h-4 w-4" /> Accept
                    </Button>
                    <Button
                      className="flex-1"
                      size="sm"
                      variant="outline"
                      disabled={respond.isPending}
                      onClick={() => respond.mutate({ orderId: String(order.id), action: "decline" })}
                    >
                      <X className="mr-1.5 h-4 w-4" /> Decline
                    </Button>
                  </div>
                }
              />
            ))}
          </div>
        ) : (
          <OrdersTable orders={orders} />
        )}
      </div>
    </AppShell>
  );
}
