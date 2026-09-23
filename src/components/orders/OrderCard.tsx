import { Link } from "@tanstack/react-router";
import { BookOpen, FileText, Layers } from "lucide-react";

import { formatCurrency } from "@/lib/format";
import type { Order } from "@/types/portal";
import DeadlinePill from "@/components/orders/DeadlinePill";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";

export default function OrderCard({ order, footer }: { order: Order; footer?: React.ReactNode }) {
  return (
    <article className="surface-card flex flex-col gap-4 p-4 transition-shadow hover:shadow-[var(--shadow-raised)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to="/orders/$orderId"
            params={{ orderId: String(order.id) }}
            className="line-clamp-2 text-sm font-semibold hover:text-primary sm:text-base"
          >
            {order.title || `Order ${order.id}`}
          </Link>
          <p className="mt-0.5 text-xs text-muted-foreground">#{order.id}</p>
        </div>
        <OrderStatusBadge status={order.assignment_status || order.status} />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        {order.subject && (
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" /> {order.subject}
          </span>
        )}
        {order.type && (
          <span className="inline-flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" /> {order.type}
          </span>
        )}
        {order.pages ? (
          <span className="inline-flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" /> {order.pages} pages
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <DeadlinePill deadline={order.deadline} />
        <span className="text-sm font-semibold">{formatCurrency(order.budget, order.currency)}</span>
      </div>

      {footer}
    </article>
  );
}
