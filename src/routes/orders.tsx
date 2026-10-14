import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Check, FileText, Hand } from "lucide-react";
import { toast } from "sonner";
import { ExpertShell } from "@/components/expert/ExpertShell";
import { ExpertCardSkeletons, SignInState } from "@/components/expert/ExpertStates";
import { Button } from "@/components/ui/button";
import { expertRequest, ExpertAuthRequiredError } from "@/lib/expert-api";

type AvailableOrder = {
  id: string;
  reference?: string;
  title?: string;
  subject?: string;
  deadline?: string;
  assignmentType?: string;
  interested?: boolean;
};

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Available orders | ScholarDesk Expert Portal" },
      { name: "description", content: "Review suitable ScholarDesk orders and privately register interest with support." },
      { property: "og:title", content: "Available orders | ScholarDesk Expert Portal" },
      { property: "og:description", content: "Review suitable ScholarDesk orders and privately register interest with support." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
     { property: "og:image", content: "https://scholardesk.pro/brand/og-image.png" }, { name: "twitter:image", content: "https://scholardesk.pro/brand/og-image.png" }],
  }),
  component: AvailableOrders,
});

function AvailableOrders() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["expert-orders", "available"],
    queryFn: () => expertRequest<AvailableOrder[]>("/orders/available"),
    retry: false,
  });
  const interest = useMutation({
    mutationFn: (orderId: string) => expertRequest(`/expert/orders/${orderId}/interests`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expert-orders", "available"] });
      toast.success("Interest sent", { description: "Support will consider it alongside expertise, quality and availability." });
    },
    onError: () => toast.error("Interest could not be sent. Please try again."),
  });

  return (
    <ExpertShell title="Available orders" description="Suitable unassigned work selected from your expertise and subjects.">
      <div className="space-y-5">
        <div className="border-l-2 border-primary pl-4 text-sm text-muted-foreground">
          Interest is private and does not reserve or assign an order. Support makes every final assignment.
        </div>
        {query.isLoading ? <ExpertCardSkeletons /> : query.error instanceof ExpertAuthRequiredError ? (
          <SignInState label="available orders" />
        ) : (query.data?.length ?? 0) === 0 ? (
          <div className="surface-panel p-10 text-center">
            <p className="font-display font-semibold">No suitable orders available</p>
            <p className="mt-1 text-sm text-muted-foreground">New opportunities will appear as support reviews incoming briefs.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {query.data?.map((order) => (
              <article key={order.id} className="surface-panel flex flex-col p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-primary">{order.reference ?? `#${order.id}`}</span>
                  <span className="text-xs text-muted-foreground">Available</span>
                </div>
                <h2 className="mt-4 font-display font-semibold">{order.title ?? "Untitled order"}</h2>
                <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><FileText className="size-4" />{order.subject ?? "General"} · {order.assignmentType ?? "Assignment"}</p>
                <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><CalendarClock className="size-4" />{order.deadline ? new Date(order.deadline).toLocaleString() : "Deadline pending"}</p>
                <Button className="mt-5 self-start" size="sm" variant={order.interested ? "secondary" : "default"} disabled={order.interested || interest.isPending} onClick={() => interest.mutate(order.id)}>
                  {order.interested ? <><Check /> Interest sent</> : <><Hand /> I’m interested</>}
                </Button>
              </article>
            ))}
          </div>
        )}
      </div>
    </ExpertShell>
  );
}