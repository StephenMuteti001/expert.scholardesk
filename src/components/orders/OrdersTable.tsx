import { Link } from "@tanstack/react-router";

import { formatCurrency } from "@/lib/format";
import type { Order } from "@/types/portal";
import DeadlinePill from "@/components/orders/DeadlinePill";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function OrdersTable({ orders }: { orders: Order[] }) {
  return (
    <div className="surface-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Assignment</TableHead>
            <TableHead className="hidden md:table-cell">Subject</TableHead>
            <TableHead className="hidden lg:table-cell">Scope</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead className="text-right">Pay</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="align-top">
              <TableCell>
                <Link
                  to="/orders/$orderId"
                  params={{ orderId: String(order.id) }}
                  className="font-medium hover:text-primary"
                >
                  {order.title || `Order ${order.id}`}
                </Link>
                <p className="text-xs text-muted-foreground">#{order.id}</p>
              </TableCell>
              <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                {order.subject || "—"}
              </TableCell>
              <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                {order.type || "—"}
                {order.pages ? ` · ${order.pages}p` : ""}
              </TableCell>
              <TableCell>
                <DeadlinePill deadline={order.deadline} />
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(order.budget, order.currency)}
              </TableCell>
              <TableCell>
                <OrderStatusBadge status={order.assignment_status || order.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
