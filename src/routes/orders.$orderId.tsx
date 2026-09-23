import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  Download,
  FileText,
  Loader2,
  MessageSquare,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import api, { API_ORIGIN, apiErrorMessage } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useOrder } from "@/hooks/useAssignments";
import AppShell from "@/components/layout/AppShell";
import DeadlinePill from "@/components/orders/DeadlinePill";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/orders/$orderId")({
  head: ({ params }) => ({
    meta: [
      { title: `Assignment #${params.orderId} — ScholarDesk Expert Portal` },
      {
        name: "description",
        content: "Full brief, files, deadline and delivery actions for this assignment.",
      },
      { property: "og:title", content: `Assignment #${params.orderId}` },
      {
        property: "og:description",
        content: "Full brief, files, deadline and delivery actions for this assignment.",
      },
    ],
  }),
  component: OrderDetail,
});

function Detail({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value || "—"}</p>
    </div>
  );
}

function OrderDetail() {
  const { orderId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: order, isLoading } = useOrder(orderId);

  const respond = useMutation({
    mutationFn: async (action: "accept" | "decline") => {
      await api.post(`/orders/${orderId}/${action}`);
      return action;
    },
    onSuccess: (action) => {
      toast.success(action === "accept" ? "Assignment accepted" : "Assignment declined");
      void queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      void queryClient.invalidateQueries({ queryKey: ["assignments"] });
      if (action === "decline") void navigate({ to: "/orders", search: { tab: "new", q: "" } });
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Could not update this assignment")),
  });

  if (isLoading) {
    return (
      <AppShell title="Assignment">
        <div className="flex justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  if (!order) {
    return (
      <AppShell title="Assignment">
        <p className="text-sm text-muted-foreground">This assignment is no longer available.</p>
      </AppShell>
    );
  }

  const stage = String(order.assignment_status || order.status || "").toLowerCase();
  const isNew = stage === "assigned" || stage === "pending";

  return (
    <AppShell
      title={order.title || `Assignment #${order.id}`}
      description={`Order #${order.id}`}
      actions={
        <Button asChild variant="ghost" size="sm">
          <Link to="/orders" search={{ tab: "new", q: "" }}>
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </Link>
        </Button>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <section className="surface-card space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <OrderStatusBadge status={order.assignment_status || order.status} />
              <DeadlinePill deadline={order.deadline} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Detail label="Subject" value={order.subject} />
              <Detail label="Type" value={order.type} />
              <Detail label="Academic level" value={order.academic_level} />
              <Detail label="Pages" value={order.pages ? `${order.pages} pages` : undefined} />
              <Detail label="Words" value={order.words ? `${order.words} words` : undefined} />
              <Detail label="Citation style" value={order.citation_style} />
              <Detail label="Sources" value={order.sources} />
              <Detail label="Due" value={order.deadline ? formatDateTime(order.deadline) : undefined} />
              <Detail label="Assigned" value={order.assigned_at ? formatDateTime(order.assigned_at) : undefined} />
            </div>
          </section>

          <section className="surface-card space-y-2 p-5">
            <h2 className="text-sm font-semibold">Instructions</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {order.instructions || order.description || "No additional instructions were provided."}
            </p>
          </section>

          <section className="surface-card space-y-3 p-5">
            <h2 className="text-sm font-semibold">Attached files</h2>
            {order.files?.length ? (
              <ul className="divide-y divide-border">
                {order.files.map((file) => (
                  <li key={file.id} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="flex min-w-0 items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{file.name || file.file_name}</span>
                    </span>
                    <a
                      href={file.url?.startsWith("http") ? file.url : `${API_ORIGIN}${file.url ?? ""}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No files attached to this order.</p>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <div className="surface-card space-y-3 p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Your pay</p>
            <p className="text-2xl font-semibold">{formatCurrency(order.budget, order.currency)}</p>

            {isNew ? (
              <div className="flex gap-2 pt-1">
                <Button
                  className="flex-1"
                  disabled={respond.isPending}
                  onClick={() => respond.mutate("accept")}
                >
                  <Check className="mr-1.5 h-4 w-4" /> Accept
                </Button>
                <Button
                  className="flex-1"
                  variant="outline"
                  disabled={respond.isPending}
                  onClick={() => respond.mutate("decline")}
                >
                  <X className="mr-1.5 h-4 w-4" /> Decline
                </Button>
              </div>
            ) : (
              <Button asChild className="w-full">
                <Link to="/orders/$orderId/submit" params={{ orderId: String(order.id) }}>
                  <Upload className="mr-1.5 h-4 w-4" /> Submit work
                </Link>
              </Button>
            )}

            <Button asChild variant="outline" className="w-full">
              <Link to="/messages" search={{ orderId: String(order.id) }}>
                <MessageSquare className="mr-1.5 h-4 w-4" /> Message support about this order
              </Link>
            </Button>
          </div>

          {order.client && (
            <div className="surface-card space-y-2 p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Customer</p>
              <p className="text-sm font-medium">{order.client.name || "Customer"}</p>
              {order.client.country && (
                <p className="text-sm text-muted-foreground">{order.client.country}</p>
              )}
            </div>
          )}
        </aside>
      </div>
    </AppShell>
  );
}
