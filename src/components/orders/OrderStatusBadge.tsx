import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  assigned: { label: "New assignment", className: "bg-accent/12 text-accent border-accent/30" },
  pending: { label: "Awaiting response", className: "bg-warning/15 text-warning border-warning/30" },
  in_progress: { label: "In progress", className: "bg-info/12 text-info border-info/30" },
  "in-progress": { label: "In progress", className: "bg-info/12 text-info border-info/30" },
  active: { label: "In progress", className: "bg-info/12 text-info border-info/30" },
  in_review: { label: "In review", className: "bg-primary-soft text-primary border-primary/25" },
  "in-review": { label: "In review", className: "bg-primary-soft text-primary border-primary/25" },
  revision: { label: "Revision", className: "bg-warning/15 text-warning border-warning/30" },
  in_revision: { label: "Revision", className: "bg-warning/15 text-warning border-warning/30" },
  "in-revision": { label: "Revision", className: "bg-warning/15 text-warning border-warning/30" },
  completed: { label: "Completed", className: "bg-success/12 text-success border-success/30" },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground border-border" },
  declined: { label: "Declined", className: "bg-muted text-muted-foreground border-border" },
};

export function OrderStatusBadge({ status, className }: { status?: string; className?: string }) {
  const key = (status ?? "").toLowerCase();
  const config = STATUS_STYLES[key] ?? {
    label: status ? status.replace(/[-_]/g, " ") : "Unknown",
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}

export default OrderStatusBadge;
