import { cn } from "@/lib/utils";
import {
  PAYMENT_LABELS,
  STAGE_LABELS,
  type ChatStatus,
  type OrderStage,
  type PaymentStatus,
} from "@/lib/portal-types";

const base =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-tight whitespace-nowrap";

const stageTone: Record<OrderStage, string> = {
  quote_requested: "border-warning/30 bg-warning/12 text-warning",
  quote_sent: "border-gold/40 bg-gold/15 text-gold",
  awaiting_payment: "border-warning/30 bg-warning/12 text-warning",
  matching_writer: "border-info/30 bg-info/12 text-info",
  in_progress: "border-primary/30 bg-primary/12 text-primary",
  quality_review: "border-info/30 bg-info/12 text-info",
  delivered: "border-success/30 bg-success/12 text-success",
  revision_in_progress: "border-warning/30 bg-warning/12 text-warning",
  completed: "border-success/30 bg-success/12 text-success",
  cancelled: "border-destructive/30 bg-destructive/10 text-destructive",
};

const paymentTone: Record<PaymentStatus, string> = {
  unpaid: "border-border bg-muted text-muted-foreground",
  partially_paid: "border-warning/30 bg-warning/12 text-warning",
  paid: "border-success/30 bg-success/12 text-success",
  refund_requested: "border-gold/40 bg-gold/15 text-gold",
  refunded: "border-border bg-muted text-muted-foreground",
};

const chatTone: Record<ChatStatus, string> = {
  open: "border-success/30 bg-success/12 text-success",
  pending: "border-warning/30 bg-warning/12 text-warning",
  resolved: "border-info/30 bg-info/12 text-info",
  archived: "border-border bg-muted text-muted-foreground",
};

export function StageBadge({ stage, className }: { stage: OrderStage; className?: string }) {
  return <span className={cn(base, stageTone[stage], className)}>{STAGE_LABELS[stage]}</span>;
}

export function PaymentBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  return (
    <span className={cn(base, paymentTone[status], className)}>
      <span className="size-1.5 rounded-full bg-current" />
      {PAYMENT_LABELS[status]}
    </span>
  );
}

export function ChatStatusBadge({ status, className }: { status: ChatStatus; className?: string }) {
  return (
    <span className={cn(base, chatTone[status], "capitalize", className)}>{status}</span>
  );
}
